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
  CloseButton,
} from "@chakra-ui/react";
import type { ChatMessage, Pokemon, Votes } from "../types/pokemon";
import { PokeCard } from "./PokeCard";
import { globalStyles, dashStyles as styles } from "./styles";
import { Chat } from "./Chat";
import { fetchPokemon } from "./helpers/helper";
import "../App.css";
import { Dialog } from "@chakra-ui/react";

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
  const [isConnected, setIsConnected] = useState(false);

  const [showStats, setShowStats] = useState(false);
  const [voters, setVoters] = useState<Set<string>>(new Set());

  const peerRef = useRef<Peer | null>(null);
  //@ts-ignore
  const connsRef = useRef<Record<string, Peer.DataConnection>>({});
  //@ts-ignore
  const hostConnRef = useRef<Peer.DataConnection | null>(null);

  const pokemonsRef = useRef<Pokemon[]>([]);
  const votesRef = useRef<Votes>({});
  const chatRef = useRef<ChatMessage[]>([]);

  // Keep refs updated
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

  // Initialize Peer
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

        conn.on("open", () => sendFullStateTo(conn));
      }
    });

    return () => {
      peer.destroy();
    };
  }, [isHost]);

  //@ts-ignore
  const sendFullStateTo = (conn: Peer.DataConnection) => {
    conn.send({
      type: "initial_state",
      pokemons: pokemonsRef.current,
      votes: votesRef.current,
      chatMessages: chatRef.current,
    });
  };

  const connectToPeer = () => {
    if (!remoteId.trim() || !peerRef.current) return;
    const conn = peerRef.current.connect(remoteId);
    hostConnRef.current = conn;
    setIsHost(false);

    conn.on("open", () => {
      setConnectionStatus("✅ Connected to host!");
      conn.send({ type: "request_state" });
      setIsConnected(true);
    });
    conn.on("data", (msg) => handleIncomingData(msg));
    conn.on("close", () => setConnectionStatus("Disconnected from host"));
  };

  const regenPokemon = async () => {
    const randomId1 = Math.floor(Math.random() * 1010) + 1;
    const randomId2 = Math.floor(Math.random() * 1010) + 1;

    const newPokemon1 = await fetchPokemon(randomId1);
    const newPokemon2 = await fetchPokemon(randomId2);

    setPokemons([newPokemon1, newPokemon2]);
    setVotes({ [newPokemon1.name]: 0, [newPokemon2.name]: 0 });
    setHasVoted(false);
    setShowStats(false);
    setVoters(new Set());

    broadcast({
      type: "regen",
      pokemons: [newPokemon1, newPokemon2],
    });

    setChatMessages((prev) => [
      ...prev,
      { from: "System", message: "Resetting Pokémon…" },
    ]);
  };

  const vote = (pokemon: string) => {
    if (hasVoted) return;
    setHasVoted(true);

    if (isHost) {
      updateVotes(pokemon, peerId);
    } else {
      hostConnRef.current?.send({ type: "vote", pokemon });
    }
  };

  const updateVotes = (pokemon: string, voterId: string) => {
    setVotes((prevVotes) => {
      const updatedVotes = {
        ...prevVotes,
        [pokemon]: (prevVotes[pokemon] || 0) + 1,
      };
      votesRef.current = updatedVotes;

      setVoters((prevVoters) => {
        const newVoters = new Set(prevVoters);
        newVoters.add(voterId);

        const totalPeers = Object.keys(connsRef.current).length + 1;
        if (newVoters.size >= totalPeers) setShowStats(true);

        return newVoters;
      });

      // Broadcast to all peers
      Object.values(connsRef.current).forEach((conn) => {
        if (conn.open) conn.send({ type: "votes_update", votes: updatedVotes });
      });

      return updatedVotes;
    });
  };

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

  const handleIncomingData = (message: any, fromPeer?: string) => {
    switch (message.type) {
      case "vote":
        if (isHost && fromPeer) updateVotes(message.pokemon, fromPeer);
        break;

      case "votes_update":
        setVotes(message.votes);
        break;

      case "regen":
        setPokemons(message.pokemons);
        setVotes({
          [message.pokemons[0].name]: 0,
          [message.pokemons[1].name]: 0,
        });
        setHasVoted(false);
        setShowStats(false);
        setVoters(new Set());
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
        if (isHost && fromPeer) {
          Object.values(connsRef.current).forEach((conn) => {
            if (conn.open && conn.peer !== fromPeer)
              conn.send({ type: "chat", text: message.text });
          });
        }
        break;

      case "initial_state":
        setPokemons(message.pokemons);
        setVotes(message.votes);
        setChatMessages(message.chatMessages);
        setHasVoted(false);
        break;

      case "voting_closed":
        setShowStats(true);
        break;

      default:
        break;
    }
  };

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

  const getPercentage = (name: string) => {
    const total = Object.values(votes).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    return Math.round((votes[name] / total) * 100);
  };

  const winnerName = getWinner();
  const winnerPokemon = pokemons.find((p) => p.name === winnerName);

  return (
    <VStack {...styles.container} className={"font"}>
      {isConnected && (
        <>
          <Heading {...styles.mainHeading}>Pokémon Battle Royale</Heading>
          <HStack {...styles.mainGrid}>
            {pokemons.map((p) => (
              <PokeCard
                key={p.id}
                data={p}
                onVote={vote}
                votes={votes[p.name] || 0}
                hasVoted={hasVoted}
                isWinner={getWinner() === p.name}
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
            <Button {...globalStyles.button} onClick={regenPokemon}>
              New Battle
            </Button>
          )}
        </>
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
              <Button onClick={connectToPeer} {...globalStyles.button}>
                Connect
              </Button>
            </HStack>
          </Box>

          {!isHost && (
            <Button {...globalStyles.button} onClick={() => setIsHost(true)}>
              Become Host
            </Button>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};
