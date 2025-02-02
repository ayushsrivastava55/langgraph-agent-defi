import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { defiTools } from "./defiTools";

const weatherTool = tool(
  async ({ query }) => {
    if(
      query.toLowerCase().includes("sf") || 
      query.toLowerCase().includes("san francisco")
    ) {
      return "It's 60 degrees and foggy"
    }
    return "It's 90 degrees and sunny"
  },
  {
    name: "weather",
    description: "Call to get the current weather for a location",
    schema: z.object({
      query: z.string()
      .describe("The query to use in your search"),
    }),
  }
);

const search = new TavilySearchResults({
  maxResults: 2,
});

export const tools = [search, weatherTool, ...defiTools]; 