import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import { ZeroShotAgent } from "langchain/agents";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { AgentExecutor } from "langchain/agents";
import SerpAPITool from "../tools/SerpAPI";
import WebBrowserTool from "../tools/WebBrowser";

const ResearchAgent = async (topic) => {
  console.log({ topic });

  try {
    // tools
    const SerpAPI = SerpAPITool();
    const WebBrowser = WebBrowserTool();
    const tools = [SerpAPI, WebBrowser];

    // prompt template
    const promptTemplate = ZeroShotAgent.createPrompt(tools, {
      prefix: `Answer the following questions as best as you can. You have access to the following tool:`,
      suffix: `Begin! Answer concisely. It's OK to say don't know.`,
    });

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      new SystemMessagePromptTemplate(promptTemplate),
      HumanMessagePromptTemplate.fromTemplate(`{input}`),
    ]);

    // chat open ai (model / LLM)
    const chat = new ChatOpenAI({});
    const llmChain = new LLMChain({
      prompt: chatPrompt,
      llm: chat,
    });

    // Agent = tools, LLM, prompt, template
    const agent = new ZeroShotAgent({
      llmChain,
      allowedTools: tools.map((tool) => tool.name),
    });

    const executer = AgentExecutor.fromAgentAndTools({
      agent,
      tools,
      returnIntermediateSteps: false,
      maxIterations: 3,
      verbose: true,
    });

    const result = executer.run(`Who is ${topic}?`);

    return result;
  } catch (err) {
    console.error(err);
  }
};

export default ResearchAgent;
