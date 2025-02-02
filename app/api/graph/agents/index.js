import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tools } from "../tools";
import { DEFI_SYSTEM_PROMPT } from "../prompts/defiPrompt";

export function createAgent() {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-pro",
    maxOutputTokens: 2048,
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.7,
    modelKwargs: {
      systemPrompt: DEFI_SYSTEM_PROMPT,
    }
  });

  // Add explicit tool binding with descriptions
  const agentWithTools = model.bindTools(tools, {
    toolSystemPrompt: `You have access to the following tools:
    - get_price: Use this to check cryptocurrency prices
    - get_gas: Use this to check network gas fees
    - analyze_pool: Use this to get liquidity pool metrics
    - compare_yields: Use this to compare yield opportunities
    
    Always use these tools when answering queries about prices, gas, pools, or yields.`
  });

  return agentWithTools;
} 