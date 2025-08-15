import React, { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import "./App.css";

type Pokemon = {
  name: string;
  sprite: string;
  weight: number;
  height: number;
  base_experience: number;
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

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<any>(null);

  // Fetch Pokémon data
  useEffect(() => {
    const fetchPokemon = async (name: string) => {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
      );
      const data = await res.json();
      return {
        name: data.name,
        sprite: data.sprites.front_default,
        weight: data.weight,
        height: data.height,
        base_experience: data.base_experience,
      };
    };

    const loadPokemons = async () => {
      const bulba = await fetchPokemon("Bulbasaur");
      const pika = await fetchPokemon("Pikachu");
      setPokemons([bulba, pika]);
    };

    loadPokemons();
  }, []);

  // Initialize PeerJS
  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      setPeerId(id);
      setConnectionStatus("✅ Ready, share your ID to connect");
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

  const handleIncomingData = (message: any) => {
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
    <div className="App">
      <h1>Pokémon Battle Royale</h1>

      <div className="main-container">
        <div className="pokemon-container">
          {pokemons.map((p) => (
            <div key={p.name} className="pokemon-card">
              <h2 className="capitalize">{p.name}</h2>
              <img src={p.sprite} alt={p.name} />
              <p>Weight: {p.weight}</p>
              <p>Height: {p.height}</p>
              <p>Base XP: {p.base_experience}</p>
              <button
                className="vote-button"
                disabled={hasVoted}
                onClick={() => vote(p.name)}
              >
                Vote
              </button>
              <p className="vote-count">{votes[p.name as keyof Votes]} votes</p>
            </div>
          ))}
        </div>

        {/* Chat panel */}
        <div className="chat-panel">
          <h3>Chat</h3>
          <div className="chat-messages">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`chat-message ${
                  msg.from === "You" ? "you" : "peer"
                }`}
              >
                <strong>{msg.from}:</strong> {msg.message}
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>

      <h2 className="winner">Winner: {getWinner()}</h2>

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
