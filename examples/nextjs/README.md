# Minimal Next.js Example

Copy these files into a Next.js app using `@solana/wallet-adapter-react`.

```txt
lib/ore-chat.ts
components/OreChatMini.tsx
```

Then render the component client-side:

```tsx
import dynamic from "next/dynamic";

const OreChatMini = dynamic(() => import("@/components/OreChatMini"), { ssr: false });

export default function Page() {
  return <OreChatMini />;
}
```
