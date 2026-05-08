# Embed Chat in a gOREat Wall / Tile-Market App

For a prediction-market UI, chat works best as a companion panel to the live wall, activity feed, and position controls — not as part of the settlement or buy pipeline.

## Good placements

- Desktop redesign: embed the chat inside a right/left rail panel.
- Legacy layout: use a collapsible overlay sidebar.
- Mobile: bottom sheet opened from a floating chat button.

## State separation

Keep these independent:

- Tile market reads: current cycle, pot, cursor, tile ownership, activity feed.
- Wallet actions: buy tile(s), claim, close losing position, housekeeping/cranking.
- Chat reads/writes: ORE chat history, SSE stream, message sends, reactions.

The chat can mention market activity, but chat messages should never trigger buys, claims, or settlement actions.

## Embedded mode pattern

```tsx
const ChatSidebar = dynamic(
  () => import("@/components/chat/ChatSidebar").then((m) => m.ChatSidebar),
  { ssr: false },
);

export function ChatPanel() {
  return (
    <aside className="h-full min-h-0 rounded-2xl border border-zinc-800 bg-zinc-950/80">
      <ChatSidebar embed />
    </aside>
  );
}
```

`embed` means the parent owns the panel layout; the chat component should not render its own fixed-position overlay or floating toggle.

## Prediction-market specific UX tips

- Show chat online/realtime state, but do not label it as market liveness.
- Keep the buy modal and chat composer visually distinct.
- If a user clicks a tile, preserve that selection even if new chat messages arrive.
- Do not auto-scroll the page when chat receives a message; only scroll the chat panel.
- For public launches, keep moderation and transaction logic separate.

## Minimal file map

```txt
frontend/lib/chat/ore-chat.ts             # API client/types
frontend/components/chat/ChatSidebar.tsx  # read/write/chat state
frontend/components/redesign/ChatPanel.tsx# embedded rail wrapper
frontend/app/_legacy/PageLegacy.tsx       # overlay usage
frontend/app/_redesign/PageRedesign.tsx   # rail-panel usage
```
