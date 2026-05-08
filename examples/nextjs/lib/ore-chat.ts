const ORE_API = "https://api.ore.supply";

export type ChatMessage = {
  id: number;
  authority: string;
  username: string;
  text: string;
  ts: number;
};

export async function loadChatHistory(limit = 50): Promise<ChatMessage[]> {
  const url = new URL(`${ORE_API}/chat/history`);
  url.searchParams.set("limit", String(limit));
  const data = await fetch(url).then((r) => r.json());
  return data.messages ?? [];
}

export function connectToChat(onMessage: (m: ChatMessage) => void) {
  const source = new EventSource(`${ORE_API}/connect`);
  source.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    if ("Chat" in payload) onMessage(payload.Chat);
    if ("ChatBatch" in payload) payload.ChatBatch.forEach(onMessage);
  };
  return () => source.close();
}

export async function authenticateChat(publicKey: string, signMessage: (m: Uint8Array) => Promise<Uint8Array>) {
  const message = `Please sign this message to authenticate with ORE.\nTimestamp: ${Date.now()}`;
  const bytes = new TextEncoder().encode(message);
  const signature = await signMessage(bytes);
  const messageBase64 = btoa(String.fromCharCode(...bytes));
  const signatureBase64 = btoa(String.fromCharCode(...signature));

  const res = await fetch(`${ORE_API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: messageBase64, client_pubkey: publicKey, signature: signatureBase64 }),
  });
  if (!res.ok) throw new Error(`chat auth failed: ${res.status}`);
  return (await res.json()).token as string;
}

export async function sendChatMessage(jwt: string, authority: string, text: string) {
  return fetch(`${ORE_API}/chat/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ authority, text, id: 0, ts: 0, username: "" }),
  }).then((r) => r.json());
}
