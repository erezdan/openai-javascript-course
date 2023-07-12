import { OpenAI } from "langchain/llms/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { ConversationChain, LLMChain } from "langchain/chains";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { SerpAPI } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { BufferMemory } from "langchain/memory";
import { PlanAndExecuteAgentExecutor } from "langchain/experimental/plan_and_execute";
import { exec } from "child_process";

// api keys
// to run the openai & serp & other services...
// run this command for setting the key
// $env:OPENAI_API_KEY = "sk-60S...9LD"
// $env:SERPAPI_API_KEY = "67d7a...4d0"

// to run this module (quickstart.mjs), go to terminal and enter: cd playground
// then enter: node quickstart.mjs

// creating the tamplate text
const template =
  "You are a director of social media with 30 years of experience." +
  "Please give me some ideas for content I should write about regarding {topic}? The content is about {socialplatform}. Translate to {language}";

// creating the prompt tamplate object
const prompt = new PromptTemplate({
  template: template,
  inputVariables: ["topic", "socialplatform", "language"],
});

// now we need to formate the prompt with the variables
/*const formattedPromptTamplate = await prompt.format({
  topic: "artificial intelligence",
  socialplatform: "twitter",
  language: "spanish",
});

console.log({ formattedPromptTamplate });*/

// creating a simple LLM chain, 1. creating the prompt tamplate 2. call to openai

// temrature value is 0=not creative - 1=very creative
/*const model = new OpenAI({ temperature: 0.9 });
const chain = new LLMChain({ prompt: prompt, llm: model });
const resChain = await chain.call({
  topic: "artificial intelligience",
  socialplatform: "twitter",
  language: "english",
});

console.log({ resChain });*/

// agents
// chain = pre-defined
// agent = task + tools + template => it figures out what to do

const agentModel = new OpenAI({
  temprature: 0,
  modelName: "text-davinci-003", // on platform.openai.com/docs/models/ there are many models out there
});

/*{
  api_key:
    "67d7a9c7c2115df9a5abfa42fbcf2916272634301efd48f74ab7b8c21a8af4d0",
}*/

const tools = [
  new SerpAPI(process.env.SERPAPI_API_KEY, {
    location: "Dallas, Texas, United States",
    hl: "en",
    gl: "us",
  }),
  new Calculator(),
];

/*const exceutor = await initializeAgentExecutorWithOptions(tools, agentModel, {
  agentType: "zero-shot-react-description",
  verbose: true,
  maxIterations: 5,
});

const input = "What is lanchain?";
const result = await exceutor.call({ input });
console.log({ result });*/

/**
 *
 * Plan and action Agent
 *
 */

const chatModel = new ChatOpenAI({
  temprature: 0,
  modelName: "gpt-3.5-turbo",
  verbose: true,
});

// we dont tell it HOW to do it, we just tell it WHAT to do.
const executer = PlanAndExecuteAgentExecutor.fromLLMAndTools({
  llm: chatModel,
  tools: tools,
});

/*const result = await executer.call({
  input:
    "Who is the current president of the United States name and age? and raised his age to the second power?",
});

console.log({ result });*/

// MEMORY
const llm = new OpenAI({ verbose: true });
const memory = new BufferMemory();
const conversationChain = new ConversationChain({ llm: llm, memory: memory });

const res1 = await conversationChain.call({ input: "Hi, may name is Erez" });
console.log(res1);

const res2 = await conversationChain.call({ input: "What is my name?" });
console.log(res2);
