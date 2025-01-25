/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
// import { OpenAIApi, Configuration } from "openai-edge";
// import { createOpenAI } from '@ai-sdk/openai';
// import { embed } from 'ai';

// /*eslint-disable*/

import { OpenAIApi, Configuration } from "openai-edge";
const config = new Configuration({
    basePath:'https://api.302.ai/v1',
    apiKey:'sk-OooJY9Pv6FEBxShrP66ykFSqZQcNCoqzLNs5YJcwyybVmgp2',
});

const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
    try {
        // console.log("text", text)
        const text1 = "你好 我需要你的帮助"
        const response = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: text1.replace(/\n/g, " "),
        });
        
        const result = await response.json();
        if (!result || !result.data || !result.data[0]) {
            throw new Error("Invalid response from API");
        }
        // console.log(result)
        return result.data[0].embedding as number[];
    } catch (error) {
        console.log("error calling openai embeddings api", error);
        throw error;
    }
}