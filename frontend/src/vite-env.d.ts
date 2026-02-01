/// <reference types="vite/client" />

// Environment variables
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_WS_URL: string;
    readonly VITE_ENABLE_CHAT: string;
    readonly VITE_ENABLE_WEBSOCKET: string;
    readonly VITE_CLERK_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// Type declarations for CSS imports
declare module '*.css' {
    const content: Record<string, string>;
    export default content;
}

// Type declarations for image imports
declare module '*.svg' {
    const content: string;
    export default content;
}

declare module '*.png' {
    const content: string;
    export default content;
}

declare module '*.jpg' {
    const content: string;
    export default content;
}
