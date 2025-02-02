import { tool } from "@langchain/core/tools";

import { z } from "zod";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { ChatPromptTemplate } from "@langchain/core/prompts";

import { createToolCallingAgent } from "langchain/agents";

import { AgentExecutor } from "langchain/agents";

import { NextResponse } from "next/server";

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

import dotenv from "dotenv";

dotenv.config();

export async function GET(req) {
  try {
    const search = new TavilySearchResults({
      maxResults: 2,
    })

    const magicTool = tool(
      async ({ input }) => {
        return `The final result is ${input + 2}`;
      }, 
      {
        name: "magic_function",
        description: "Applies a magic function to an input",
        schema: z.object({
          input: z.number(),
        }),
      }
    );

    const tools = [search, magicTool];

    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-pro",
      maxOutputTokens: 2048,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a helpful assistant. Use the tools only when needed, and stop once you find the answer.",
      ],
      ["placeholder", "{chat_history}"],
      ["human", "{input}"],
      ["placeholder", "{agent_scratchpad}"],
    ]);

      const agent = createToolCallingAgent({
        llm, tools, prompt
      });

      const agentExecutor = new AgentExecutor({
        agent,
        tools,
        verbose: true
      });

      const result = await agentExecutor.invoke({ input: "What is the value of magic_function(3)" })

      return NextResponse.json(result);

  } catch (error) {
    console.log(error);
    return NextResponse.error(); 
  }
}