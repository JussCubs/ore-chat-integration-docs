# Embed Chat in a refinORE-Style Mining App

A mining dashboard has one hard rule: chat must never interfere with mining controls, claim flows, balance polling, or transaction timing.

## Recommended UI

Desktop:

- Collapsed by default.
- Fixed left sidebar or rail panel.
- Width around `280-340px` when open.
- Shows unread count while collapsed.
- Optional `C` keyboard shortcut to toggle.

Mobile:

- Floating chat button above the app nav.
- Opens as a bottom sheet.
- Close on backdrop tap or swipe down.

## Component layout

```txt
components/chat/
  ChatSidebar.tsx      # state, history, SSE, auth, unread count
  ChatMessage.tsx      # message row, replies, reactions
  ChatInput.tsx        # composer, throttled typing
  ChatAvatar.tsx       # image or wallet gradient fallback
  ChatToggle.tsx       # desktop rail button + mobile FAB
lib/chat/
  ore-chat.ts          # API client + types
```

## Integration point

```tsx
import dynamic from "next/dynamic";

const ChatSidebar = dynamic(
  () => import("@/components/chat/ChatSidebar").then((m) => m.ChatSidebar),
  { ssr: false },
);

export default function AppShell() {
  return (
    <>
      <main>{/* mining dashboard */}</main>
      <ChatSidebar />
    </>
  );
}
```

Use a dynamic import because the chat client uses browser-only APIs like `EventSource`, `localStorage`, and wallet adapter hooks.

## Mining-app guardrails

- Keep chat auth opt-in so wallet signature popups do not appear on page load.
- Do not block mining polling while chat history loads.
- Do not couple chat connection status to mining session status.
- Do not reuse transaction-signing UI copy for chat signatures; label chat auth clearly.
- Cap message length client-side before sending.
- Render external/user content as text, not HTML.

## Useful polish

Wallet fallback avatar:

```ts
export function gradientFromAddress(address: string) {
  const chars = address.slice(-8);
  let sum1 = 0;
  let sum2 = 0;
  for (let i = 0; i < 4; i++) {
    sum1 += chars.charCodeAt(i) || 0;
    sum2 += chars.charCodeAt(i + 4) || 0;
  }
  return `linear-gradient(135deg, hsl(${sum1 % 360}, 70%, 60%), hsl(${sum2 % 360}, 70%, 60%))`;
}
```

Timestamp formatting:

```ts
export function formatTimestamp(ts: number) {
  const date = new Date(ts * 1000);
  const today = date.toDateString() === new Date().toDateString();
  return today
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}
```
