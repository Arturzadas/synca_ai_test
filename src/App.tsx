import React, { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import "./App.css";

type Pokemon = {
  id: number;
  name: string;
  sprite: string;
  weight: number;
  height: number;
  base_experience: number;
  types: string[];
  abilities: string[];
};

type Votes = {
  [key: string]: number;
};

type ChatMessage = {
  from: string;
  message: string;
};

function App() {
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

    // Generate random IDs
    const randomId1 = Math.floor(Math.random() * 1010) + 1;
    const randomId2 = Math.floor(Math.random() * 1010) + 1;

    // Fetch Pokémon data
    const newPokemon1 = await fetchPokemon(randomId1);
    const newPokemon2 = await fetchPokemon(randomId2);

    // Update local state
    setPokemons([newPokemon1, newPokemon2]);

    // Reset votes and voting status
    setVotes({ [newPokemon1.name]: 0, [newPokemon2.name]: 0 });
    setHasVoted(false);

    // Send new Pokémon IDs to peer
    if (connRef.current && connRef.current.open) {
      connRef.current.send({
        type: "regen",
        pokemons: [newPokemon1.id, newPokemon2.id],
      });

      // Send system message
      connRef.current.send({
        type: "chat",
        text: "System: Resetting Pokémon…",
      });
    }

    // Optionally add the system message locally
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

      // If no remoteId yet, this peer is host
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

      // Any peer connecting is not host
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

  function getTypeEmoji(type: string) {
    const map: Record<string, string> = {
      fire: "🔥",
      water: "💧",
      grass: "🌿",
      electric: "⚡",
      ice: "❄️",
      fighting: "🥊",
      poison: "☠️",
      ground: "🌍",
      flying: "🕊️",
      psychic: "🔮",
      bug: "🐛",
      rock: "🪨",
      ghost: "👻",
      dark: "🌑",
      dragon: "🐉",
      steel: "⚙️",
      fairy: "🧚",
      normal: "⭐",
    };
    return map[type] || "❔";
  }

  return (
    <div className="App">
      <h1>Pokémon Battle Royale</h1>

      <div className="main-container">
        <div className="pokemon-container">
          {pokemons.map((p) =>
            p.sprite ? (
              <div
                key={p.id}
                className={`pokemon-card ${
                  getWinner() === p.name.toLowerCase() ? "winner-card" : ""
                }`}
              >
                {/* Title */}
                <h2 className="pokemon-name capitalize">{p.name}</h2>

                {/* Image */}
                <img src={p.sprite} alt={p.name} className="pokemon-image" />

                {/* Types */}
                <div className="pokemon-types">
                  {p.types.map((t) => (
                    <span key={t} className="type-badge">
                      {getTypeEmoji(t)} {t}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="pokemon-stats">
                  <div className="stat">
                    <span className="stat-icon">⚖️</span> {p.weight}
                  </div>
                  <div className="stat">
                    <span className="stat-icon">📏</span> {p.height}
                  </div>
                  <div className="stat xp-bar">
                    <span>XP:</span>
                    <div className="xp-container">
                      <div
                        className="xp-fill"
                        style={{
                          width: `${
                            (Math.min(p.base_experience, 255) / 255) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span>{p.base_experience}</span>
                  </div>
                </div>

                {/* Abilities accordion */}
                <details className="abilities">
                  <summary>Abilities</summary>
                  <ul>
                    {p.abilities.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </details>

                {/* Voting */}
                <div className="vote-section">
                  <button
                    className="vote-button"
                    disabled={hasVoted}
                    onClick={() => vote(p.name)}
                  >
                    Vote
                  </button>
                  <p className="vote-count">
                    {votes[p.name as keyof Votes]} votes
                  </p>
                </div>
              </div>
            ) : null
          )}
        </div>

        {/* Chat panel */}
        <div className="chat-panel">
          <h3>Chat</h3>
          <div className="chat-messages">
            {chatMessages?.length !== 0 ? (
              chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`chat-message ${
                    msg.from === "You" ? "you" : "peer"
                  }`}
                >
                  <strong>{msg.from}:</strong> {msg.message}
                </div>
              ))
            ) : (
              <div className={"chat-message"}>No messages yet {":("}</div>
            )}
          </div>
          <input
            type="text"
            placeholder="Type a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className={"chatInput"}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>

      <h2 className="winner">Winner: {getWinner()}</h2>

      {!isHost && <button onClick={regenPokemon}>Regenerate</button>}

      <div className="peer-panel">
        <p className="connection-status">{connectionStatus}</p>

        <div>
          <label>Your Peer ID:</label>
          <input type="text" value={peerId} readOnly />
        </div>

        <div>
          <label>Connect to Peer ID:</label>
          <input
            type="text"
            value={remoteId}
            onChange={(e) => setRemoteId(e.target.value)}
          />
          <button onClick={connectToPeer}>Connect</button>
        </div>
      </div>
    </div>
  );
}

export default App;
