import Groq from 'groq-sdk';
import { environment } from './environment';

export const groqClient = new Groq({
    apiKey: environment.groqApiKey,
});

export const llmConfig = {
    model: 'mixtral-8x7b-32768',
    temperature: 0.3,
    maxTokens: 1024,
    topP: 1,
    stream: false,
} as const;

export default groqClient;
