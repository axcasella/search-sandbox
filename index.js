import { PineconeClient } from "@pinecone-database/pinecone";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/text";
import { PDFLoader } from "langchain/document_loaders/pdf";
import * as dotenv from "dotenv";
import { createPineconeIndex } from "./1-createPineconeIndex.js";
import { updatePinecone } from "./2-updatePinecone.js";
import { queryPineconeVectorStoreAndQueryLLM } from "./3-queryPineconeVectorStoreAndQueryLLM.js";

dotenv.config();

const loader = new DirectoryLoader("./documents", {
  ".txt": (path) => new TextLoader(path),
  ".pdf": (path) => new PDFLoader(path),
});

const docs = await loader.load();

// import { Configuration, OpenAIApi } from "openai";
// import express from "express";
// import bodyParser from "body-parser";
// import cors from "cors";

// const configuration = new Configuration({
//   organization: "org-OqXxaHHtx4RLvFS592zWYq9r",
//   apiKey: "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",
// });

// const openai = new OpenAIApi(configuration);

// const app = express();
// const port = 3000;

// app.use(bodyParser.json());
// app.use(cors());

// app.post("/", async(req, res) => {
//   const { message } = req.body;

//   const completion = await openai.createChatCompletion({
//     model: "gpt-3.5-turbo",
//     messages: [
//       {role: "user", content: `${message}`},
//     ]
//   });

//   res.json({
//     completion: completion.data.choices[0].message,
//   })
// })

// app.listen(port, () => {
//   console.log("app running on port", port);
// })
