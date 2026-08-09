import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

// A single-node replica set — required so code that uses transactions
// (cart merge, fulfilment, refunds) works under test, same as Atlas.
let replset: MongoMemoryReplSet;

beforeAll(async () => {
  replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replset.getUri());
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (replset) await replset.stop();
});
