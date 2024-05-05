import { config, mongo } from '../../deps.ts';
const env = config();

const uri = env.MONGO_URI;

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

export const db = client.db('sample_mflix');
