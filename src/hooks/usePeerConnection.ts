(window as any).global = window;

import { useRef, useState } from "react";
import Peer from "simple-peer";

type Message = { type: "vote"; pokemon: string };

export function usePeerConnection() {
  const peerRef = useRef<Peer.Instance | null>(null);
  const [votes, setVotes] = useState<{ [key: string]: number }>({});
  const [connected, setConnected] = useState(false);

  const createPeer = (initiator: boolean) => {
    const peer = new Peer({ initiator, trickle: false });
    peerRef.current = peer;

    peer.on("signal", (data) => {
      console.log("Signal (copy this to other peer):", JSON.stringify(data));
    });

    peer.on("connect", () => {
      console.log("Peer connected");
      setConnected(true);
      // Send current votes to new peer
      peer.send(JSON.stringify({ type: "syncVotes", votes }));
    });

    peer.on("data", (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === "vote") {
        setVotes((prev) => ({
          ...prev,
          [msg.pokemon]: (prev[msg.pokemon] || 0) + 1,
        }));
      } else if (msg.type === "syncVotes") {
        setVotes(msg.votes);
      }
    });

    return peer;
  };

  const connectPeer = (signalData: string) => {
    const peer = peerRef.current;
    if (!peer) return;
    peer.signal(JSON.parse(signalData));
  };

  const sendVote = (pokemon: string) => {
    setVotes((prev) => ({
      ...prev,
      [pokemon]: (prev[pokemon] || 0) + 1,
    }));
    peerRef.current?.send(JSON.stringify({ type: "vote", pokemon }));
  };

  return { createPeer, connectPeer, sendVote, votes, connected };
}
