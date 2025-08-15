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
  SimpleGrid,
} from "@chakra-ui/react";
import type { ChatMessage, Pokemon, Votes } from "../types/pokemon";
import { PokeCard } from "./PokeCard";
import { dashStyles as styles } from "./styles";
import { Chat } from "./Chat";

export const PokeDash = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [votes, setVotes] = useState<Votes>({ Bulbasaur: 0, Pikachu: 0 });
  const [hasVoted, setHasVoted] = useState(false);

  const [peerId, setPeerId] = useState<string>("");
  const [remoteId, setRemoteId] = useState<string>("");
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Not connected");

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const [isHost, setIsHost] = useState(true);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<any>(null);

  // Fetch Pokémon data
  useEffect(() => {
    const fetchPokemon = async (id: number | string) => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await res.json();
      return {
        id: data.id,
        name: data.name,
        sprite: data.sprites.front_default,
        weight: data.weight,
        height: data.height,
        base_experience: data.base_experience,
        types: data.types?.map((t: any) => t.type.name) || [],
        abilities: data.abilities?.map((a: any) => a.ability.name) || [],
      };
    };

    const loadPokemons = async () => {
      const bulba = await fetchPokemon("Bulbasaur");
      const pika = await fetchPokemon("Pikachu");
      setPokemons([bulba, pika]);
    };

    loadPokemons();
  }, []);

  const regenPokemon = async () => {
    const fetchPokemon = async (id: number) => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await res.json();
      return {
        id: data.id,
        name: data.name,
        sprite: data.sprites.front_default,
        weight: data.weight,
        height: data.height,
        base_experience: data.base_experience,
        types: data.types?.map((t: any) => t.type.name) || [],
        abilities: data.abilities?.map((a: any) => a.ability.name) || [],
      };
    };

    const randomId1 = Math.floor(Math.random() * 1010) + 1;
    const randomId2 = Math.floor(Math.random() * 1010) + 1;

    const newPokemon1 = await fetchPokemon(randomId1);
    const newPokemon2 = await fetchPokemon(randomId2);

    setPokemons([newPokemon1, newPokemon2]);
    setVotes({ [newPokemon1.name]: 0, [newPokemon2.name]: 0 });
    setHasVoted(false);

    if (connRef.current && connRef.current.open) {
      connRef.current.send({
        type: "regen",
        pokemons: [newPokemon1.id, newPokemon2.id],
      });

      connRef.current.send({
        type: "chat",
        text: "System: Resetting Pokémon…",
      });
    }

    setChatMessages((prev) => [
      ...prev,
      { from: "System", message: "Resetting Pokémon…" },
    ]);
  };

  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      setPeerId(id);
      setConnectionStatus("✅ Ready, share your ID to connect");

      if (!remoteId) {
        setIsHost(true);
      }
    });

    peer.on("connection", (conn) => {
      connRef.current = conn;
      setConnectionStatus("Peer connected!");
      conn.on("data", handleIncomingData);
      conn.on("close", () => setConnectionStatus("Peer disconnected"));
      conn.on("error", (err) => {
        console.error("Connection error:", err);
        setConnectionStatus("❌ Connection error");
      });

      setIsHost(false);
    });

    peerRef.current = peer;

    return () => {
      peer.destroy();
    };
  }, []);

  const connectToPeer = () => {
    if (!remoteId.trim() || !peerRef.current) return;
    const conn = peerRef.current.connect(remoteId);
    connRef.current = conn;

    conn.on("open", () => setConnectionStatus("✅ Connected to peer!"));
    conn.on("data", handleIncomingData);
    conn.on("close", () => setConnectionStatus("Peer disconnected"));
    conn.on("error", (err) => {
      console.error("Connection error:", err);
      setConnectionStatus("❌ Connection error");
    });
  };

  const vote = (pokemon: string) => {
    if (hasVoted) return;

    setVotes((prev) => ({
      ...prev,
      [pokemon]: (prev[pokemon] || 0) + 1,
    }));

    if (connRef.current && connRef.current.open) {
      connRef.current.send({ type: "vote", pokemon });
    }

    setHasVoted(true);
  };

  const handleIncomingData = async (message: any) => {
    if (message.type === "vote") {
      setVotes((prev) => {
        const updated = { ...prev };
        if (!updated[message.pokemon]) updated[message.pokemon] = 0;
        updated[message.pokemon] += 1;
        return updated;
      });
    } else if (message.type === "chat") {
      setChatMessages((prev) => [
        ...prev,
        { from: "Peer", message: message.text },
      ]);
    } else if (message.type === "regen") {
      const loadById = async (id: number) => {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await res.json();
        return {
          id,
          name: data.name,
          sprite: data.sprites.front_default,
          weight: data.weight,
          height: data.height,
          base_experience: data.base_experience,
          types: data.types?.map((t: any) => t.type.name) || [],
          abilities: data.abilities?.map((a: any) => a.ability.name) || [],
        };
      };

      const [p1, p2] = await Promise.all(
        message.pokemons.map((id: number) => loadById(id))
      );

      setPokemons([p1, p2]);
      setVotes({ [p1.name]: 0, [p2.name]: 0 });
      setHasVoted(false);

      setChatMessages((prev) => [
        ...prev,
        { from: "System", message: "Resetting Pokémon…" },
      ]);
    }
  };

  const sendMessage = () => {
    if (!chatInput.trim() || !connRef.current || !connRef.current.open) return;

    const message = chatInput.trim();
    connRef.current.send({ type: "chat", text: message });
    setChatMessages((prev) => [...prev, { from: "You", message }]);
    setChatInput("");
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

      {!isHost && (
        <Button colorScheme="red" onClick={regenPokemon}>
          Regenerate
        </Button>
      )}

      <Box {...styles.connectionBox}>
        <Text mb={2}>Connection Status: {connectionStatus}</Text>

        <VStack {...styles.hstackGap}>
          <Box {...styles.inputBox}>
            <Text>Your Peer ID:</Text>
            <Input value={peerId} />
          </Box>

          <Box>
            <Text>Connect to Peer ID:</Text>
            <HStack>
              <Input
                value={remoteId}
                onChange={(e) => setRemoteId(e.target.value)}
              />
              <Button onClick={connectToPeer} colorScheme="green">
                Connect
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Box>
    </VStack>
  );
};
