import React, { useRef, useState } from "react";

export default function P2PTest() {
  const pc = useRef<RTCPeerConnection>(null);
  const channel = useRef<RTCDataChannel | null>(null);

  const [offer, setOffer] = useState("");
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  // Create Host
  const createOffer = async () => {
    pc.current = new RTCPeerConnection();

    // Data channel for host
    channel.current = pc.current.createDataChannel("chat");
    setupChannel(channel.current);

    pc.current.onicecandidate = () => {
      if (pc.current?.iceGatheringState === "complete") {
        setOffer(JSON.stringify(pc.current.localDescription));
      }
    };

    const offerDesc = await pc.current.createOffer();
    await pc.current.setLocalDescription(offerDesc);
  };

  // Join as Peer
  const joinRoom = async () => {
    pc.current = new RTCPeerConnection();

    pc.current.ondatachannel = (event) => {
      channel.current = event.channel;
      setupChannel(channel.current);
    };

    pc.current.onicecandidate = () => {
      if (pc.current?.iceGatheringState === "complete") {
        setAnswer(JSON.stringify(pc.current.localDescription));
      }
    };

    await pc.current.setRemoteDescription(JSON.parse(offer));
    const answerDesc = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answerDesc);
  };

  // Accept Peer Answer
  const acceptAnswer = async () => {
    if (!pc.current) return;
    await pc.current.setRemoteDescription(JSON.parse(answer));
  };

  // Send message over DataChannel
  const sendMessage = () => {
    if (channel.current?.readyState === "open") {
      channel.current.send(input);
      setMessages((prev) => [...prev, `Me: ${input}`]);
      setInput("");
    }
  };

  // Setup channel event listeners
  const setupChannel = (ch: RTCDataChannel) => {
    ch.onopen = () => console.log("DataChannel open");
    ch.onmessage = (e) => setMessages((prev) => [...prev, `Peer: ${e.data}`]);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Serverless WebRTC Test</h2>

      <div style={{ display: "flex", gap: "1rem" }}>
        {/* Host */}
        <div style={{ flex: 1 }}>
          <h3>Host</h3>
          <button onClick={createOffer}>Create Offer</button>
          <textarea
            placeholder="Offer SDP"
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            rows={6}
            style={{ width: "100%" }}
          />
          <textarea
            placeholder="Paste Answer SDP"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            style={{ width: "100%" }}
          />
          <button onClick={acceptAnswer}>Accept Answer</button>
        </div>

        {/* Peer */}
        <div style={{ flex: 1 }}>
          <h3>Peer</h3>
          <textarea
            placeholder="Paste Offer SDP from Host"
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            rows={6}
            style={{ width: "100%" }}
          />
          <textarea
            placeholder="Answer SDP"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            style={{ width: "100%" }}
          />
          <button onClick={joinRoom}>Join Room (Peer)</button>
        </div>
      </div>

      <hr />
      <div>
        <h3>Chat</h3>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message..."
        />
        <button onClick={sendMessage}>Send</button>
        <ul>
          {messages.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
