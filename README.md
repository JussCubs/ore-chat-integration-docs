# ORE Chat Integration

Simple public docs for embedding the existing ORE chat into an ORE-related app.

This is just a lightweight frontend integration guide for reading chat, authenticating with a wallet signature, and sending messages/reactions through the public ORE chat API. It is not a private chat system and it does not include mining, prediction-game, or strategy logic.

## Docs

- [ORE chat API basics](docs/ore-chat.md)
- [Embedding chat in an app](docs/embed-chat.md)
- [Minimal Next.js example](examples/nextjs)

## What this covers

- Load recent ORE chat history.
- Subscribe to realtime chat updates with Server-Sent Events.
- Authenticate a connected wallet with `signMessage`.
- Send chat messages, reactions, and typing indicators.
- Add chat as a simple sidebar/panel without touching app transaction flows.

## What this does not cover

- Private APIs, secrets, or backend credentials.
- Mining or prediction-game strategy logic.
- Any transaction, escrow, claim, settlement, or cranking code.
- A new chat backend — this uses the existing ORE chat.

## Base API

```txt
https://api.ore.supply
```

## License

MIT
