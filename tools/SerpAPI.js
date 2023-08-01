import { SerpAPI } from "langchain/tools";

// the serp api using Bing for searches

const SerpAPITool = () => {
  const serpAPI = new SerpAPI(process.env.SERPAPI_API_KEY, {
    baseUrl: "http://localhost:3000/agents",
    location: "Tel Aviv, Israel",
    hl: "en",
    gl: "us",
  });

  // grab the most recent results
  serpAPI.returnDirect = true;

  return serpAPI;
};

export default SerpAPITool;
