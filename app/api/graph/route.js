import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { NextResponse } from "next/server";
import { createWorkflow } from "./workflow";
import dotenv from "dotenv";

dotenv.config();

export async function GET(req) {
  try {
    const workflow = createWorkflow();
    const checkpointer = new MemorySaver();
    const app = workflow.compile({ checkpointer });

    const finalState = await app.invoke(
      {
        messages: [
          new HumanMessage("what is weather in san francisco"),
        ],
      },
      { configurable: { thread_id: "42" } }
    );

    return NextResponse.json({
      // response: finalState.messages[finalState.messages.length - 1].content
      response: finalState
    });

  } catch (error) {
    console.log(error);
    return NextResponse.json(error.message);
  }
}

export async function POST(req) {
  try {
    const { query } = await req.json();
    console.log("Incoming query:", query);  // Debug log

    const workflow = createWorkflow();
    const checkpointer = new MemorySaver();
    const app = workflow.compile({ checkpointer });

    const finalState = await app.invoke(
      {
        messages: [
          new HumanMessage(query),
        ],
      },
      { configurable: { thread_id: crypto.randomUUID() } }
    );

    // Debug logs
    console.log("Final state:", JSON.stringify(finalState, null, 2));
    const response = finalState.messages[finalState.messages.length - 1].content;
    console.log("Response:", response);

    // If response is too short, add error message
    if (response.length < 20) {
      return NextResponse.json({
        error: "Response too brief. Please try your query again.",
        response: response
      }, { status: 400 });
    }

    return NextResponse.json({
      response: response
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ 
      error: "Error processing your request",
      details: error.message 
    }, { status: 500 });
  }
}