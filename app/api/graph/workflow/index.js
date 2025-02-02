import { StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { Annotation } from "@langchain/langgraph";
import { tools } from "../tools";
import { createAgent } from "../agents";

export const GraphState = Annotation.Root({
  messages: Annotation({
    reducer: (x, y) => x.concat(y),
  }),
});

function shouldContinue(state) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];

  if(lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "__end__"
}

async function callModel(state) {
  const messages = state.messages;
  const model = createAgent();
  const response = await model.invoke(messages);

  return { messages: [response] };
}

export function createWorkflow() {
  const toolNode = new ToolNode(tools);

  return new StateGraph(GraphState)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent",  shouldContinue)
    .addEdge("tools", "agent")
    .addEdge("tools", "__end__");
} 