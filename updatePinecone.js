import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { v4 as uuidv4 } from 'uuid';

export const updatePinecone = async (indexName, docs, client) => {
  const index = client.Index(indexName);

  console.log(`Updating index ${indexName}`);

  for (const doc of docs) {
    console.log("processing doc", doc.metadata.source);
    const filePath = doc.metadata.source;
    const text = doc.pageContent;
    console.log("\npageContent\n", text);
    console.log();

    console.log("splitting text into chunks");
    const textSplitter = new RecursiveCharacterTextSplitter({
      characters: ['.', '\n', '\n\n'],
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await textSplitter.createDocuments([text]);
    console.log();
    console.log("finished splitting text into chunks size", chunks.length);
    console.log();

    const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
      chunks.map((chunk) => 
        chunk.pageContent.replace(/\n/g, " ")
      )
    )
    
    console.log("finished embedding document", doc.metadata.source);
    await upsertVectors(filePath, chunks, embeddingsArrays, index);
  }
}

// create helper function that creates and upserts vectors in batches of 100 to pinecone
export const upsertVectors = async (filePath, chunks, embeddingsArrays, index) => {
  const batchSize = 100;
  let batch = [];

  console.log("chunks.length", chunks.length);
  console.log("embeddingsArrays.length", embeddingsArrays.length);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const vector = {
      id: `${filePath}-${i}-${uuidv4()}`,
      values: embeddingsArrays[i],
      metadata: {
        ...chunk.metadata,
        loc: JSON.stringify(chunk.metadata.loc), // where the vector is in the document
        pageContent: chunk.pageContent,
        filePath: filePath,
      }
    };

    console.log("vector ID:", vector.id);
    batch.push(vector);

    // upsert vectors in batches of 100
    if (batch.length === batchSize || i === chunks.length - 1) {
      console.log("\nbatch", batch);
      console.log(`starting to upsert to pinecone with ${batch.length} vectors`);
      try {
        const result = await index.upsert({
          upsertRequest: {
            vectors: batch,
          }
        });

        console.log(`upsert ${result.upsertedCount} done , resetting batch`);
      } catch (err) {
        console.log("error upserting vectors", err);
      }
      
      // reset batch
      batch = [];
    }
  }

  console.log(`Pinecone index updated for ${filePath}`);
}

