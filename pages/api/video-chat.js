// /pages/api/transcript.js
import { YoutubeTranscript } from "youtube-transcript";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { OpenAI } from "langchain";
import { log } from "console";

// Global variables
let chain;
let chatHistory = [];

// DO THIS SECOND
const initializeChain = async (initialPrompt, transcript) => {
  try {
    const model = new ChatOpenAI({
      temperature: 0.8, // temprature = 0 means no creative, and 1 is very creative
      modelName: "gpt-3.5-turbo",
    });

    //HNSWLib
    const vectorStore = await HNSWLib.fromDocuments(
      [{ pageContent: transcript }],
      new OpenAIEmbeddings()
    );

    /*const directory =
      "C:/DEV/Udemy/openai-javascript-course/transcriptDirectory";
    await vectorStore.save(directory);

    const loadedVectorStore = await HNSWLib.load(
      directory,
      new OpenAIEmbeddings()
    );*/

    chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever(),
      { verbose: true }
    );

    const response = await chain.call({
      question: initialPrompt,
      chat_history: chatHistory,
    });

    chatHistory.push({ role: "assistant", content: response.text });

    console.log({ chatHistory });
    return response;
  } catch (error) {
    console.error(error);
  }
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    // DO THIS FIRST
    const { prompt, firstMsg } = req.body;
    console.log("p: " + prompt, "f: " + firstMsg);

    // Then if it's the first message, we want to initialize the chain, since it doesn't exist yet
    if (firstMsg) {
      try {
        const initialPrompt = `Give me a summary of the trascript: ${prompt}`;

        chatHistory.push({
          role: "user",
          content: initialPrompt,
        });

        // Youtube Transcript API
        const transcriptResponse = await YoutubeTranscript.fetchTranscript(
          prompt
        );

        if (!transcriptResponse) {
          return res.status(400).json({ error: "Failed to get transcript" });
        }

        let transcript = "";
        transcriptResponse.forEach((line) => {
          transcript += line.text;
        });

        log(transcript);

        const response = await initializeChain(initialPrompt, transcript);

        // And then we'll jsut get the response back and the chatHistory
        return res.status(200).json({ output: response, chatHistory });
      } catch (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "An error occurred while fetching transcript" });
      }

      // do this third!
    } else {
      // If it's not the first message, we can chat with the bot

      try {
        chatHistory.push({ role: "user", content: prompt });

        const response = await chain.call({
          question: prompt,
          chat_history: chatHistory,
        });

        chatHistory.push({ role: "assistant", content: response.text });

        log(response);

        return res.status(200).json({ output: response, chatHistory });
      } catch (error) {
        // Generic error handling
        console.error(error);
        res
          .status(500)
          .json({ error: "An error occurred during the conversation." });
      }
    }
  }
}
