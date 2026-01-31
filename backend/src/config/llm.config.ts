import Groq from 'groq-sdk';
import { environment } from './environment';

export const groqClient = new Groq({
    apiKey: environment.groqApiKey,
});

export const llmConfig = {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    maxTokens: 1024,
    topP: 1,
    stream: false,
} as const;

export default groqClient;
