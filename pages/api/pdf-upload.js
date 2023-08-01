import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PineconeClient } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { CharacterTextSplitter } from "langchain/text_splitter";

// Example: https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/pdf

export default async function handler(req, res) {
  if (req.method === "GET") {
    console.log("Uploading book");
    // Enter your code here
    /** STEP ONE: LOAD DOCUMENT */
    const bookPath =
      "C:/DEV/Udemy/openai-javascript-course/data/document_loaders/naval-ravikant-book.pdf";
    const loader = new PDFLoader(bookPath);

    const docs = await loader.load();

    if (docs.length === 0) {
      console.log("No documents found.");
      return;
    }

    const splitter = new CharacterTextSplitter({
      separator: " ",
      chunkSize: 250,
      chunkOverlap: 10,
    });

    const splitDocs = await splitter.splitDocuments(docs);

    // Reduce the size of the metadata for each document -- lots of useless pdf information
    const reducedDocs = splitDocs.map((doc) => {
      const reducedMetadata = { ...doc.metadata };
      delete reducedMetadata.pdf; // Remove the 'pdf' field
      return new Document({
        pageContent: doc.pageContent,
        metadata: reducedMetadata,
      });
    });

    // docs.forEach((doc) => {
    //   console.log(doc);
    // });

    // console.log(`Uploading documents to Pinecone: ${docs}`);

    console.log(docs[100]);
    console.log(splitDocs[100].metadata);
    console.log(reducedDocs[100].metadata);

    /** STEP TWO: UPLOAD TO DATABASE */

    const client = new PineconeClient();
    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });

    const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

    await PineconeStore.fromDocuments(reducedDocs, new OpenAIEmbeddings(), {
      pineconeIndex,
    });

    /*const client = new PineconeClient();

    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });

    const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

    await PineconeStore.fromDocuments(reducedDocs, new OpenAIEmbeddings(), {
      pineconeIndex,
    });*/

    console.log("Successfully uploaded to DB");
    // Modify output as needed
    return res.status(200).json({
      result: `Uploaded to Pinecone! Before splitting: ${docs.length}, After splitting: ${splitDocs.length}`,
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

//////////////////////////
//////////////////////////
//////////////////////////
//////////////////////////
//////////////////////////
//////////////////////////
//////////////////////////
//////////////////////////
async function handler___(req, res) {
  if (req.method === "GET") {
    console.log(req);
    console.log("Inside the PDF handler");

    // Enter your code here
    /** STEP ONE: LOAD DOCUMENT */
    const bookPath =
      "C:/DEV/Udemy/openai-javascript-course/data/document_loaders/naval-ravikant-book.pdf";
    console.log(bookPath);

    const loader = new PDFLoader(bookPath);
    const docs = await loader.load();
    console.log(docs);

    if (docs.length === 0) {
      console.log("no docs found");
      return;
    }

    // Chunk it
    const splitter = new CharacterTextSplitter({
      seperator: " ",
      chunkSize: 250,
      chunkOverlap: 10,
    });

    const splitDocs = await splitter.splitDocuments(docs);

    // Reduce the size of the metadata
    const reducedDocs = splitDocs.map((doc) => {
      const reduceMetadata = { ...doc.metadata };
      delete reduceMetadata.pdf;

      return new Document({
        pageContent: doc.pageContent,
        metadata: reduceMetadata,
      });
    });
    //console.log(reducedDocs[0]);

    console.log("splitDocs.length: " + splitDocs.length);

    console.log(process.env.PINECONE_ENVIRONMENT);
    console.log(process.env.PINECONE_API_KEY);
    console.log(process.env.PINECONE_INDEX);

    //return res.status(200).json({});

    try {
      /** STEP TWO: UPLOAD TO DATABASE */

      // pinecone configuration
      const pinecone = new PineconeClient();
      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      });

      // init pinecone
      await pinecone.init({
        environment: process.env.PINECONE_ENVIRONMENT,
        apiKey: process.env.PINECONE_API_KEY,
      });

      const index = pinecone.Index(process.env.PINECONE_INDEX);
      const pineconeStoreData = reducedDocs.map((text) => text.pageContent);

      // getting error at this line.
      await PineconeStore.fromTexts(pineconeStoreData, null, embeddings, index);

      /*
      const client = PineconeClient();
      await client.init({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT,
      });

      const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

      await PineconeStore.fromDocuments(
        reducedDocs,
        new OpenAIEmbeddings(),
        {
          pineconeIndex,
        }
      );*/

      console.log("successfully uploaded to the database!");
    } catch (error) {
      console.log(error);
    }

    // upload documents to Pinecone
    return res.status(200).json({ result: docs });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
