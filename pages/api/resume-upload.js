// /pages/api/resume_upload.js
// Import dependencies

/**
 * This endpoint is used to load the resumes into the chain, then upload them to the Pinecone database.
 * Tutorial: https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/directory
 * Summarization: https://js.langchain.com/docs/modules/chains/other_chains/summarization
 * Dependencies: npm install pdf-parse
 */

// supabase: supabase.com
// project:  langchain
// pass:     nn*Y69nR6-R4$B&

import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { PineconeClient } from "@pinecone-database/pinecone";
import { loadSummarizationChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // Grab the prompt from the url (?prompt=[value])
  //   console.log(process.env.PINECONE_API_KEY);
  //   console.log(process.env.PINECONE_ENVIRONMENT);
  //   console.log(process.env.PINECONE_INDEX);
  // Always use a try catch block to do asynchronous requests and catch any errors
  try {
    // load the directory
    const loader = new DirectoryLoader(
      "C:/DEV/Udemy/openai-javascript-course/data/resumes/",
      { ".pdf": (path) => new PDFLoader(path, "/pdf") }
    );

    const docs = await loader.load();
    console.log(`loaded ${docs.length}`);

    // split the documents with their metadata
    const splitter = new CharacterTextSplitter({
      separator: " ",
      chunkSize: 200,
      chunkOverlap: 20,
    });

    const splitDocs = await splitter.splitDocuments(docs);
    //console.log(`Split docs: ${splitDocs.length}`);
    //console.log(`docs[0]: ${docs[0]}`);
    //console.log(`splitDocs[0]: ${splitDocs[0]}`);

    const reducedDocs = splitDocs.map((doc) => {
      const fileName = doc.metadata.source.split("/").pop();
      const [_, firstName, lastName] = fileName.split("_");

      return {
        ...doc,
        metadata: {
          first_name: firstName,
          last_name: lastName.slice(0, -4),
          docType: "resume",
        },
      };
    });

    //console.log(reducedDocs[4]);

    let summaries = [];
    const model = new OpenAI({ temperature: 0 });
    const summarizeAllChain = loadSummarizationChain(model, {
      type: "map_reduce",
    });

    // raw documents (the original docs)
    const summarizeRes = await summarizeAllChain.call({
      input_documents: docs,
    });
    summaries.push({ summary: summarizeRes.text });
    console.log(summaries);

    // summarize each candidate
    for (let doc of docs) {
      const summarizeOneChain = loadSummarizationChain(model, {
        type: "map_reduce",
      });
      const summarizeOneRes = await summarizeOneChain.call({
        input_documents: [doc],
      });

      console.log({ summarizeOneRes });
      summaries.push({ summary: summarizeOneRes.text });
    }

    // PINECONE VERSION
    ////////////////////

    // upload the reducedDocs to Pinecone
    /*const client = new PineconeClient();
    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });

    const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

    await PineconeStore.fromDocuments(reducedDocs, new OpenAIEmbeddings(), {
      pineconeIndex,
    });
    console.log("Uploaded to Pinecode");*/

    // SUPABASE VERSION
    ///////////////////////

    const privateKey = process.env.SUPABASE_PRIVATE_KEY;
    if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);

    const url = process.env.SUPABASE_URL;
    if (!url) throw new Error(`Expected env var SUPABASE_URL`);

    const client = createClient(url, privateKey);

    // upload to Supabase
    await SupabaseVectorStore.fromDocuments(
      reducedDocs,
      new OpenAIEmbeddings(),
      { client, tableName: "documents", queryName: "match_documents" }
    );

    console.log({ summaries });

    const summaryStr = JSON.stringify(summaries, null, 2);
    return res.status(200).json({ output: summaryStr });
  } catch (err) {
    // If we have an error

    console.error(err);
    return res.status(500).json({ error: err });
  }
}
