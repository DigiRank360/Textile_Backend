// Local MongoDB for development (no system install needed). Data persists in ./.mongo-data
import { MongoMemoryServer } from "mongodb-memory-server";

const db = await MongoMemoryServer.create({
  instance: { port: 27017, dbPath: ".mongo-data", storageEngine: "wiredTiger" },
});
console.log("✅ Local MongoDB running at", db.getUri());

const stop = async () => {
  await db.stop({ doCleanup: false });
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
