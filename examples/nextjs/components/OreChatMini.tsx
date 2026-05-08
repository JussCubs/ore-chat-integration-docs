"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { authenticateChat, ChatMessage, connectToChat, loadChatHistory, sendChatMessage } from "../lib/ore-chat";

export default function OreChatMini() {
  const { publicKey, signMessage } = useWallet();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [jwt, setJwt] = useState<string | null>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    loadChatHistory(50).then(setMessages).catch(console.warn);
    return connectToChat((message) => {
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    });
  }, []);

  async function enableChat() {
    if (!publicKey || !signMessage) return;
    setJwt(await authenticateChat(publicKey.toBase58(), signMessage));
  }

  async function send() {
    if (!jwt || !publicKey || !text.trim()) return;
    await sendChatMessage(jwt, publicKey.toBase58(), text.trim());
    setText("");
  }

  return (
    <section style={{ maxWidth: 360, border: "1px solid #333", borderRadius: 12, padding: 12 }}>
      <h2>ORE Chat</h2>
      <div style={{ height: 320, overflow: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m) => (
          <div key={m.id}>
            <strong>{m.username || `${m.authority.slice(0, 4)}…${m.authority.slice(-4)}`}</strong>: {m.text}
          </div>
        ))}
      </div>
      {!jwt ? (
        <button onClick={enableChat} disabled={!publicKey || !signMessage}>Enable chat</button>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={150} />
          <button type="submit">Send</button>
        </form>
      )}
    </section>
  );
}
