import { PineconeClient } from "@pinecone-database/pinecone";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import * as dotenv from "dotenv";
import { createPineconeIndex } from "./createPineconeIndex.js";
import { updatePinecone } from "./updatePinecone.js";
import { queryPineconeAndQueryLLM } from "./queryPineconeAndLLM.js";

dotenv.config();

const loader = new DirectoryLoader("./documents", {
  ".txt": (path) => new TextLoader(path),
  ".pdf": (path) => new PDFLoader(path),
});

// const docs = await loader.load();
// console.log("docs", docs.length);

const question = "Which company was most profitable in 2022 between blackstone, KKR, and Apollo?";
const indexName = "test-pe-index";
const vectorDimension = 1536;

const client = new PineconeClient();
await client.init({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT,
});

(async () => {
  // await createPineconeIndex(indexName, vectorDimension, client);
  // await updatePinecone(indexName, docs, client);
  await queryPineconeAndQueryLLM(question, indexName, client);
})();