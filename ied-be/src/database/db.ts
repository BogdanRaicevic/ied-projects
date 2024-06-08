import { mongo } from '../../deps.ts';
import { ENV } from '../../envVariables.ts';

const uri = ENV.mongo.uri;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new mongo.MongoClient(uri, {
  serverApi: {
    version: mongo.ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect the client to the server	(optional starting in v4.7)
await client.connect();

export const db = client.db(ENV.mongo.dbName);
