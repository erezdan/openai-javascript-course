import { WebBrowser } from "langchain/tools/webbrowser";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

const WebBrowserTool = () => {
  // we don't need the results to be creative so the temrature is 0
  const model = new ChatOpenAI({ temprature: 0 });
  const embeddings = new OpenAIEmbeddings({});
  const browser = new WebBrowser(model, embeddings);

  browser.returnDirect = true;
  return browser;
};

export default WebBrowserTool;
