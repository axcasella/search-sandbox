import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";

export const queryPineconeAndQueryLLM = async (question, indexName, client) => {
  console.log("querying pinecone vector store and querying LLM");
  console.log(`Asking question: ${question}`);

  const index = client.Index(indexName);

  const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);

  let queryResponse = await index.query({
    queryRequest: {
      vector: queryEmbedding,
      topK: 10,
      includeMetadata: true,
      includeValues: true,
    }
  });

  console.log(`Found ${queryResponse.matches.length} matches`);

  if (queryResponse.matches.length) {
    let result = await queryLLM(question, queryResponse);
    console.log("answer:", result.text);
  } else {
    console.log("No matches found");
  }
}

const queryLLM = async (question, queryResponse) => {
  const llm = new OpenAI();
  const chain = loadQAStuffChain(llm);

  // concatinate query results
  const concatenatedPageContent = queryResponse.matches.map((match) => match.metadata.pageContent).join(" ");

  const result = await chain.call({
    input_documents: [new Document({ pageContent: concatenatedPageContent })],
    question: question,
  });

  return result;
}