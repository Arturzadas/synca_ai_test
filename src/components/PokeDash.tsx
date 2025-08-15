import { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
} from "@chakra-ui/react";
import type { ChatMessage, Pokemon, Votes } from "../types/pokemon";
import { PokeCard } from "./PokeCard";
import { globalStyles, dashStyles as styles } from "./styles";
import { Chat } from "./Chat";
import { fetchPokemon } from "./helpers/helper";

export const PokeDash = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [votes, setVotes] = useState<Votes>({});
  const [hasVoted, setHasVoted] = useState(false);

  const [peerId, setPeerId] = useState("");
  const [remoteId, setRemoteId] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Not connected");

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const [isHost, setIsHost] = useState(false);

  const peerRef = useRef<Peer | null>(null);
  // host: store connections to all peers
  const connsRef = useRef<Record<string, Peer.DataConnection>>({});
  // client: store connection to host
  const hostConnRef = useRef<Peer.DataConnection | null>(null);

  // refs to store the latest state for host broadcasting
  const pokemonsRef = useRef<Pokemon[]>([]);
  const votesRef = useRef<Votes>({});
  const chatRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    pokemonsRef.current = pokemons;
  }, [pokemons]);
  useEffect(() => {
    votesRef.current = votes;
  }, [votes]);
  useEffect(() => {
    chatRef.current = chatMessages;
  }, [chatMessages]);

  // Load initial Pokémon
  useEffect(() => {
    const loadPokemons = async () => {
      const bulba = await fetchPokemon("Bulbasaur");
      const pika = await fetchPokemon("Pikachu");
      setPokemons([bulba, pika]);
      setVotes({ [bulba.name]: 0, [pika.name]: 0 });
    };
    loadPokemons();
  }, []);

  // Setup PeerJS
  useEffect(() => {
    const peer = new Peer();
    peerRef.current = peer;

    peer.on("open", (id) => {
      setPeerId(id);
      setConnectionStatus("✅ Ready, share your ID to connect");
    });

    peer.on("connection", (conn) => {
      if (isHost) {
        connsRef.current[conn.peer] = conn;
        setConnectionStatus(`Peer ${conn.peer} connected`);

        conn.on("data", (msg) => handleIncomingData(msg, conn.peer));
        conn.on("close", () => delete connsRef.current[conn.peer]);

        // Wait until connection is open, then send full state
        conn.on("open", () => {
          sendFullStateTo(conn); // <-- use your helper
        });
      }
    });

    return () => {
      peer.destroy();
    };
  }, [isHost]);

  const sendFullStateTo = (conn: Peer.DataConnection) => {
    conn.send({
      type: "initial_state",
      pokemons: pokemonsRef.current,
      votes: votesRef.current,
      chatMessages: chatRef.current,
    });
  };

  // Connect to a host (client mode)
  const connectToPeer = () => {
    if (!remoteId.trim() || !peerRef.current) return;
    const conn = peerRef.current.connect(remoteId);
    hostConnRef.current = conn;
    setIsHost(false);

    conn.on("open", () => {
      setConnectionStatus("✅ Connected to host!");
      conn.send({ type: "request_state" }); // ask host for snapshot
    });
    conn.on("data", (msg) => handleIncomingData(msg));
    conn.on("close", () => setConnectionStatus("Disconnected from host"));
  };

  // Host regenerates Pokémon and sends update
  const regenPokemon = async () => {
    const randomId1 = Math.floor(Math.random() * 1010) + 1;
    const randomId2 = Math.floor(Math.random() * 1010) + 1;

    const newPokemon1 = await fetchPokemon(randomId1);
    const newPokemon2 = await fetchPokemon(randomId2);

    setPokemons([newPokemon1, newPokemon2]);
    setVotes({ [newPokemon1.name]: 0, [newPokemon2.name]: 0 });
    setHasVoted(false);

    broadcast({ type: "regen", pokemons: [newPokemon1, newPokemon2] });

    setChatMessages((prev) => [
      ...prev,
      { from: "System", message: "Resetting Pokémon…" },
    ]);
  };

  // Send a vote
  const vote = (pokemon: string) => {
    if (hasVoted) return;

    setHasVoted(true); // prevent double-click locally

    if (isHost) {
      // HOST: update votes locally and broadcast to all peers
      setVotes((prev) => {
        const updated = { ...prev, [pokemon]: (prev[pokemon] || 0) + 1 };
        votesRef.current = updated;

        // Broadcast updated votes to all peers
        Object.values(connsRef.current).forEach((conn) => {
          if (conn.open) conn.send({ type: "votes_update", votes: updated });
        });

        return updated;
      });
    } else {
      // PEER: send vote to host only
      hostConnRef.current?.send({ type: "vote", pokemon });
    }
  };

  const applyVote = (pokemon: string) => {
    setVotes((prev) => {
      const updated = { ...prev, [pokemon]: (prev[pokemon] || 0) + 1 };
      votesRef.current = updated; // keep ref in sync
      return updated;
    });
  };

  // Send chat message
  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();

    if (isHost) {
      broadcast({ type: "chat", text: msg });
    } else {
      hostConnRef.current?.send({ type: "chat", text: msg });
    }

    setChatMessages((prev) => [...prev, { from: "You", message: msg }]);
    setChatInput("");
  };

  // Handle incoming data (both host and clients)
  const handleIncomingData = (message: any, fromPeer?: string) => {
    switch (message.type) {
      case "vote":
        if (isHost) {
          // HOST receives a vote from a peer
          setVotes((prev) => {
            const updated = {
              ...prev,
              [message.pokemon]: (prev[message.pokemon] || 0) + 1,
            };
            votesRef.current = updated;

            // Broadcast updated votes to all peers, including the sender
            Object.values(connsRef.current).forEach((conn) => {
              if (conn.open)
                conn.send({ type: "votes_update", votes: updated });
            });

            return updated;
          });
        }
        break;

      case "votes_update":
        // PEERS receive authoritative votes from host
        setVotes(message.votes);
        break;

      case "regen":
        setPokemons(message.pokemons);
        setVotes({
          [message.pokemons[0].name]: 0,
          [message.pokemons[1].name]: 0,
        });
        setHasVoted(false);
        setChatMessages((prev) => [
          ...prev,
          { from: "System", message: "Resetting Pokémon…" },
        ]);
        break;

      case "chat":
        setChatMessages((prev) => [
          ...prev,
          { from: isHost ? "Peer" : "Host", message: message.text },
        ]);
        if (isHost) {
          // rebroadcast chat to other peers
          Object.values(connsRef.current).forEach((conn) => {
            if (conn.open && conn.peer !== fromPeer)
              conn.send({ type: "chat", text: message.text });
          });
        }
        break;
      case "initial_state":
        // Update local state with authoritative host data
        setPokemons(message.pokemons);
        setVotes(message.votes);
        setChatMessages(message.chatMessages);
        setHasVoted(false); // reset local voting state
        break;

      default:
        break;
    }
  };

  // Host broadcast helper
  const broadcast = (msg: any) => {
    Object.values(connsRef.current).forEach((conn) => {
      if (conn.open) conn.send(msg);
    });
  };

  const getWinner = () => {
    const entries = Object.entries(votes);
    const max = Math.max(...entries.map(([, v]) => v));
    const winners = entries.filter(([, v]) => v === max).map(([k]) => k);
    return winners.length === 1 ? winners[0] : "Tie";
  };

  return (
    <VStack {...styles.container}>
      <Heading {...styles.mainHeading}>Pokémon Battle Royale</Heading>
      <HStack {...styles.mainGrid}>
        {pokemons.map((p) => (
          <PokeCard
            key={p.id}
            data={p}
            onVote={vote}
            votes={votes[p.name] || 0}
            hasVoted={hasVoted}
          />
        ))}

        <Chat
          chatMessages={chatMessages}
          setChatInput={setChatInput}
          sendMessage={sendMessage}
          chatInput={chatInput}
        />
      </HStack>

      <Heading size="md">Winner: {getWinner()}</Heading>

      {isHost && (
        <Button colorScheme="red" onClick={regenPokemon}>
          Regenerate
        </Button>
      )}

      <Box {...styles.connectionBox}>
        <Text mb={2}>Connection Status: {connectionStatus}</Text>

        <VStack {...styles.hstackGap}>
          <Box {...styles.inputBox}>
            <Text>Your Peer ID:</Text>
            <Input {...globalStyles.input} value={peerId} readOnly />
          </Box>

          <Box>
            <Text>Connect to Host ID:</Text>
            <HStack>
              <Input
                value={remoteId}
                onChange={(e) => setRemoteId(e.target.value)}
                {...globalStyles.input}
              />
              <Button onClick={connectToPeer} colorScheme="green">
                Connect
              </Button>
            </HStack>
          </Box>

          {!isHost && (
            <Button colorScheme="blue" onClick={() => setIsHost(true)}>
              Become Host
            </Button>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};
