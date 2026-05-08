# ORE Chat API Basics

Base URL:

```txt
https://api.ore.supply
```

## Read realtime chat

```ts
const events = new EventSource("https://api.ore.supply/connect");

events.onmessage = (event) => {
  const payload = JSON.parse(event.data);
  if ("Chat" in payload) handleMessage(payload.Chat);
  if ("ChatBatch" in payload) handleBatch(payload.ChatBatch);
  if ("Reaction" in payload) handleReaction(payload.Reaction);
  if ("Typing" in payload) handleTyping(payload.Typing.users);
};
```

## Load history

```ts
const url = new URL("https://api.ore.supply/chat/history");
url.searchParams.set("limit", "50");

const data = await fetch(url).then((r) => r.json());
const messages = data.messages ?? [];
```

Optional pagination:

```ts
url.searchParams.set("before", oldestMessageId.toString());
```

## Authenticate for sending

Use the connected wallet's `signMessage`, then exchange the signature for a chat JWT.

```ts
export async function authenticateChat(
  publicKey: string,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
) {
  const message = `Please sign this message to authenticate with ORE.\nTimestamp: ${Date.now()}`;
  const bytes = new TextEncoder().encode(message);
  const signature = await signMessage(bytes);

  const res = await fetch("https://api.ore.supply/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: btoa(String.fromCharCode(...bytes)),
      client_pubkey: publicKey,
      signature: btoa(String.fromCharCode(...signature)),
    }),
  });

  if (!res.ok) throw new Error(`chat auth failed: ${res.status}`);
  return (await res.json()).token as string;
}
```

Recommended UX: keep chat read-only until the user clicks **Enable chat** so wallet signature popups never appear unexpectedly.

## Send a message

```ts
await fetch("https://api.ore.supply/chat/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
  },
  body: JSON.stringify({
    authority: walletAddress,
    text,
    id: 0,
    ts: 0,
    username: "",
    reply_to_id: replyTo?.id ?? null,
    reply_to_text: replyTo?.text ?? null,
    reply_to_username: replyTo?.username ?? null,
  }),
});
```

## React to a message

```ts
await fetch("https://api.ore.supply/chat/react", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
  },
  body: JSON.stringify({ message_id: messageId, emoji: "🔥" }),
});
```

Common reactions: `👍`, `❤️`, `😂`, `😮`, `😢`, `🔥`.

## Typing indicator

```ts
await fetch(`https://api.ore.supply/chat/typing/${walletAddress}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
  },
  body: JSON.stringify({ typing: true }),
});
```

Throttle typing updates client-side.
