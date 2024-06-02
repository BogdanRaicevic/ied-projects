import { mongo } from '../../deps.ts';
import { ENV } from '../../envVariables.ts';

const uri = ENV.mongoUri;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new mongo.MongoClient(uri, {
  serverApi: {
    version: mongo.ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

await client.connect();

export const db = client.db(ENV.mongoDbName);
