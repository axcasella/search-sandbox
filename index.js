import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import * as dotenv from "dotenv";
import { QdrantVectorStore } from "langchain/vectorstores/qdrant";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

dotenv.config();

const loader = new DirectoryLoader("./documents", {
  ".txt": (path) => new TextLoader(path),
  ".pdf": (path) => new PDFLoader(path),
});

const docs = await loader.load();
console.log("docs length: ", docs.length);

const question = "What is apollo's revenue in Q2 2022";
const collectionName = "test-pe";

(async () => {
  const vectorStore = await QdrantVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings(),
    {
      url: process.env.QDRANT_URL,
      collectionName: collectionName,
    }
  );
  
  console.log("\nNow asking question\n", question);
  const response = await vectorStore.similaritySearch(question, 2);
  
  console.log("\n Answer: ", response);
})();