export const createPineconeIndex = async (indexName, dimension, client) => {
  // check if index exists
  const existingIndices = await client.listIndexes();
  if (!existingIndices.includes(indexName)) {
    const createClient = await client.createIndex({
      createRequest: {
        name: indexName,
        dimension: dimension,
        metric: "cosine",
      }
    });

    console.log(`Created index ${indexName} with client: ${createClient}`);

    await new Promise((resolve) => setTimeout(resolve, 50000));
  } else {
    console.log(`Index ${indexName} already exists`);
  }
};