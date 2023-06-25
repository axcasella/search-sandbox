import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const updatePinecone = async (indexName, docs, client) => {
  const index = client.Index(indexName);

  console.log(`Updating index ${indexName}`);

  for (const doc of docs) {
    console.log("processing doc", doc.metadata.source);
    const filePath = doc.metadata.source;
    const text = doc.pageContent;

    console.log("splitting text into chunks");
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    const chunks = await textSplitter.createDocuments([text]);
    console.log();
    console.log("finished splitting text into chunks size", chunks.length);
    console.log("finished splitting text into chunks (before replace)", chunks);
    console.log();

    const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
      chunks.map((chunk) => {
        chunk.pageContent.replace(/\n/g, " ");
        console.log("after chunking", chunk.pageContent);
      })
    )
    
    console.log("finished embedding document", doc.metadata.source);
    await upsertVectors(filePath, chunks, embeddingsArrays, index);
  }
}

// create helper function that creates and upserts vectors in batches of 100 to pinecone
export const upsertVectors = async (filePath, chunks, embeddingsArrays, index) => {
  const batchSize = 100;
  let batch = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const vector = {
      id: `${filePath}-${i}`,
      values: embeddingsArrays[i],
      metadata: {
        ...chunk.metadata,
        loc: JSON.stringify(chunk.metadata.loc), // where the vector is in the document
        pageContent: chunk.pageContent,
        filePath: filePath,
      }
    };

    batch.push(vector);

    // upsert vectors in batches of 100
    if (batch.length === batchSize || i === chunks.length - 1) {
      await index.upsert({
        upsertRequest: {
          vectors: batch,
        }
      });

      // reset batch
      batch = [];
    }
  }

  console.log(`Pinecone index updated with ${chunks.length} vectors for ${filePath}`);
}

