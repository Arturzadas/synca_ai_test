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
import "../App.css";
import { StatsDialog } from "./StatsDialog";
import { FaClipboardCheck, FaRegClipboard } from "react-icons/fa";

export const PokeDash = () => {
  //! top level state
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [votes, setVotes] = useState<Votes>({});
  const [hasVoted, setHasVoted] = useState(false);

  const [peerId, setPeerId] = useState("");
  const [remoteId, setRemoteId] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Not connected");
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]); // new

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [showStats, setShowStats] = useState(false);
  const [resultsReady, setResultsReady] = useState(false);

  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const peerRef = useRef<Peer | null>(null);
  const connsRef = useRef<any>({});
  const hostConnRef = useRef<any>(null);

  const pokemonsRef = useRef<Pokemon[]>([]);
  const votesRef = useRef<Votes>({});
  const chatRef = useRef<ChatMessage[]>([]);
  const votersRef = useRef<Set<string>>(new Set());

  //! ref refresh for data accuracy
  useEffect(() => {
    pokemonsRef.current = pokemons;
  }, [pokemons]);
  useEffect(() => {
    votesRef.current = votes;
  }, [votes]);
  useEffect(() => {
    chatRef.current = chatMessages;
  }, [chatMessages]);

  //! init useEffect
  useEffect(() => {
    const loadPokemons = async () => {
      setIsLoading(true);
      const bulba = await fetchPokemon("Bulbasaur");
      const pika = await fetchPokemon("Pikachu");
      setPokemons([bulba, pika]);
      setVotes({ [bulba.name]: 0, [pika.name]: 0 });
      setIsLoading(false);
    };
    loadPokemons();
  }, []);

  //!  detect leaving users
  useEffect(() => {
    const handleUnload = () => {
      if (isHost) {
        // Notify all peers that this host is leaving
        broadcast({ type: "host_leaving" });
      } else {
        hostConnRef.current?.send({ type: "peer_leaving" });
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [isHost]);

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
        setConnectedPeers(Object.keys(connsRef.current)); // update state

        conn.on("data", (msg) => handleIncomingData(msg, conn.peer));

        conn.on("close", () => {
          console.log("closed");
          delete connsRef.current[conn.peer];
          setConnectedPeers(Object.keys(connsRef.current)); // update state on disconnect
        });

        conn.on("open", () => sendFullStateTo(conn));
      }
    });

    return () => {
      peer.destroy();
    };
  }, [isHost]);

  //! helper functions
  const sendFullStateTo = (conn: any) => {
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
    setIsLoading(true);
    const randomId1 = Math.floor(Math.random() * 1010) + 1;
    const randomId2 = Math.floor(Math.random() * 1010) + 1;

    const newPokemon1 = await fetchPokemon(randomId1);
    const newPokemon2 = await fetchPokemon(randomId2);

    setPokemons([newPokemon1, newPokemon2]);
    setVotes({ [newPokemon1.name]: 0, [newPokemon2.name]: 0 });
    setHasVoted(false);
    setShowStats(false);

    broadcast({
      type: "regen",
      pokemons: [newPokemon1, newPokemon2],
    });

    votersRef.current.clear();
    setResultsReady(false);

    setChatMessages((prev) => [
      ...prev,
      { from: "System", message: "Resetting Pokémon…" },
    ]);
    setIsLoading(false);
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

      votersRef.current.add(voterId);

      const totalPeers = Object.keys(connsRef.current).length + 1;

      if (votersRef.current.size >= totalPeers) {
        setResultsReady(true);
        setShowStats(true);
        broadcast({ type: "voting_closed" });
      }

      Object.values(connsRef.current).forEach((conn: any) => {
        if (conn.open) conn.send({ type: "votes_update", votes: updatedVotes });
      });

      return updatedVotes;
    });
  };

  //! Peer / Host communication and data sharing
  const handleIncomingData = (message: any, fromPeer?: string) => {
    switch (message.type) {
      case "vote":
        if (isHost && fromPeer) updateVotes(message.pokemon, fromPeer);
        break;

      case "votes_update":
        setVotes(message.votes);
        break;

      case "regen":
        setIsLoading(true);
        setPokemons(message.pokemons);
        setVotes({
          [message.pokemons[0].name]: 0,
          [message.pokemons[1].name]: 0,
        });
        setHasVoted(false);
        setShowStats(false);
        setChatMessages((prev) => [
          ...prev,
          { from: "System", message: "Resetting Pokémon…" },
        ]);
        votersRef.current.clear();
        setResultsReady(false);
        setTimeout(() => setIsLoading(false), Math.random() * 1000);
        break;

      case "chat":
        setChatMessages((prev) => [
          ...prev,
          { from: isHost ? "Peer" : "Host", message: message.text },
        ]);
        if (isHost && fromPeer) {
          Object.values(connsRef.current).forEach((conn: any) => {
            if (conn.open && conn.peer !== fromPeer)
              conn.send({ type: "chat", text: message.text });
          });
        }
        break;

      case "initial_state":
        setIsLoading(true);
        setPokemons(message.pokemons);
        setVotes(message.votes);
        setChatMessages(message.chatMessages);
        setHasVoted(false);
        setIsLoading(false);
        break;

      case "voting_closed":
        setResultsReady(true);
        setShowStats(true);
        break;

      case "peer_leaving":
        // Remove the peer that left from connsRef and connectedPeers
        delete connsRef.current[fromPeer!];
        setConnectedPeers(Object.keys(connsRef.current));
        break;

      case "host_leaving":
        setConnectionStatus("Host has left");
        break;

      default:
        break;
    }
  };

  const broadcast = (msg: any) => {
    Object.values(connsRef.current).forEach((conn: any) => {
      if (conn.open) conn.send(msg);
    });
  };

  const getWinner = () => {
    const entries = Object.entries(votes);
    const max = Math.max(...entries.map(([, v]) => v));
    const winners = entries.filter(([, v]) => v === max).map(([k]) => k);
    return winners.length === 1 ? winners[0] : "Tie";
  };

  const closeDialog = () => setShowStats(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(peerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 3500);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
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

  return (
    <VStack {...styles.container} className={"font"}>
      {(isConnected || isHost) && (
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
                isLoading={isLoading}
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
          <HStack>
            {isHost && (
              <Button {...globalStyles.button} onClick={regenPokemon}>
                New Battle
              </Button>
            )}
            {resultsReady && (
              <Button
                {...globalStyles.button}
                onClick={() => setShowStats(true)}
              >
                Show Results
              </Button>
            )}
          </HStack>
        </>
      )}

      <Box {...styles.connectionBox}>
        <VStack align="start" gap={1} mb={2}>
          <Text>Connection Status:</Text>
          {isHost ? (
            connectedPeers.length > 0 ? (
              connectedPeers.map((peer) => (
                <HStack key={peer} gap={2}>
                  <Box w={3} h={3} borderRadius="full" bg="green.400" />
                  <Text>{peer}</Text>
                </HStack>
              ))
            ) : (
              <Text>No peers connected</Text>
            )
          ) : (
            <Text>{connectionStatus}</Text>
          )}
        </VStack>

        <VStack {...styles.hstackGap}>
          {isHost && (
            <Box {...styles.inputBox}>
              <Text>Your Host ID:</Text>
              <HStack>
                <Input {...globalStyles.input} value={peerId} readOnly />
                <Button
                  w={"100px"}
                  {...globalStyles.button}
                  onClick={handleCopy}
                >
                  {copied ? <FaClipboardCheck /> : <FaRegClipboard />}
                </Button>
              </HStack>
            </Box>
          )}

          {!isHost && (
            <Box>
              <Text>Connect to Host ID:</Text>
              <HStack>
                <Input
                  value={remoteId}
                  onChange={(e) => setRemoteId(e.target.value)}
                  {...globalStyles.input}
                />
                <Button
                  onClick={connectToPeer}
                  w={"100px"}
                  {...globalStyles.button}
                >
                  Connect
                </Button>
              </HStack>
            </Box>
          )}

          {!isHost && (
            <Button {...globalStyles.button} onClick={() => setIsHost(true)}>
              Become Host
            </Button>
          )}
        </VStack>
      </Box>
      {showStats && (
        <StatsDialog
          isOpen={showStats}
          onClose={closeDialog}
          pokemons={pokemons}
          votes={votes}
        />
      )}
    </VStack>
  );
};
