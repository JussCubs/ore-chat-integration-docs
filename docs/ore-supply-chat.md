# ORE Supply Chat API Integration

Base URL:

```txt
https://api.ore.supply
```

## 1. Read realtime messages

Use Server-Sent Events from the browser:

```ts
const events = new EventSource("https://api.ore.supply/connect");

events.onmessage = (event) => {
  const payload = JSON.parse(event.data);
  if ("Chat" in payload) handleMessage(payload.Chat);
  if ("ChatBatch" in payload) handleInitialBatch(payload.ChatBatch);
  if ("Reaction" in payload) handleReaction(payload.Reaction);
  if ("Typing" in payload) handleTyping(payload.Typing.users);
};
```

Common payloads:

```ts
type ChatMessage = {
  id: number;
  authority: string;        // wallet address
  username: string;
  text: string;
  ts: number;               // unix seconds
  profile_photo_url?: string;
  role?: string;
  reply_to_id?: number;
  reply_to_text?: string;
  reply_to_username?: string;
  reactions?: {
    thumbs_up: number;
    heart: number;
    laughing: number;
    surprised: number;
    sad: number;
    fire: number;
  };
};
```

## 2. Load history

```ts
const url = new URL("https://api.ore.supply/chat/history");
url.searchParams.set("limit", "50");
// optional pagination cursor
// url.searchParams.set("before", oldestMessageId.toString());

const { messages, has_more, oldest_id } = await fetch(url).then((r) => r.json());
```

## 3. Authenticate for writes

Ask the connected wallet to sign a plain auth message, then exchange it for a JWT.

```ts
export async function authenticateChat(
  publicKey: string,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
) {
  const timestamp = Date.now();
  const message = `Please sign this message to authenticate with ORE.\nTimestamp: ${timestamp}`;
  const messageBytes = new TextEncoder().encode(message);
  const signature = await signMessage(messageBytes);

  const messageBase64 = btoa(String.fromCharCode(...messageBytes));
  const signatureBase64 = btoa(String.fromCharCode(...signature));

  const res = await fetch("https://api.ore.supply/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: messageBase64,
      client_pubkey: publicKey,
      signature: signatureBase64,
    }),
  });

  if (!res.ok) throw new Error(`chat auth failed: ${res.status}`);
  return (await res.json()).token as string;
}
```

Recommended UX:

- Make chat **read-only by default**.
- Only prompt `signMessage` after the user clicks **Enable chat** or focuses the message composer.
- Cache the JWT per wallet in `localStorage`, but drop it before/when it expires.

## 4. Send a message

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

## 5. Toggle reactions

Supported display emojis:

```ts
const reactionMap = {
  "👍": "thumbs_up",
  "❤️": "heart",
  "😂": "laughing",
  "😮": "surprised",
  "😢": "sad",
  "🔥": "fire",
};
```

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

## 6. Typing indicator

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

Throttle this client-side, e.g. once every 3-5 seconds while the input changes.

## Safety notes

- Never ask for seed phrases or private keys.
- Treat chat as public community content.
- Do not put privileged app actions behind chat messages.
- Keep transaction signing flows separate from chat signing flows.
