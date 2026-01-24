import { MongoMemoryServer } from "mongodb-memory-server";

export async function setup() {
  // Pre-download MongoDB binary before tests run
  // This prevents race conditions when running tests in parallel
  const instance = await MongoMemoryServer.create();
  await instance.stop();
}
