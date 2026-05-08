# Embedding ORE Chat in an App

Keep the integration simple: chat is a companion UI, not part of your app's transaction system.

## Suggested UI

Desktop:

- Collapsed sidebar or rail panel.
- Optional unread count.
- Open only when the user chooses to view chat.

Mobile:

- Floating chat button.
- Bottom sheet or full-height drawer.

## Minimal file structure

```txt
lib/ore-chat.ts          # API helpers and types
components/ChatPanel.tsx # history, realtime stream, auth, composer
components/ChatInput.tsx # message input
components/ChatMessage.tsx
```

## Next.js client-side import

The chat uses browser APIs like `EventSource`, `localStorage`, and wallet adapter hooks, so load it client-side.

```tsx
import dynamic from "next/dynamic";

const ChatPanel = dynamic(() => import("@/components/ChatPanel"), {
  ssr: false,
});

export default function Page() {
  return (
    <>
      <main>{/* your app */}</main>
      <ChatPanel />
    </>
  );
}
```

## App safety boundaries

- Do not let chat messages trigger transactions.
- Keep buy/claim/settle/mine buttons separate from chat UI.
- Do not block app polling or transaction state while chat loads.
- Render chat text as text, not raw HTML.
- Never ask for private keys or seed phrases.
- Treat ORE chat as public community content.

## Simple display helpers

```ts
export function shortAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function formatTimestamp(ts: number) {
  const date = new Date(ts * 1000);
  const today = date.toDateString() === new Date().toDateString();
  return today
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}
```
