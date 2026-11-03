import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error("Please define MONGODB_URL in your .env.local");
}

interface MongooseConn {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}


declare global {
  var mongoose: MongooseConn | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let userIndexesReconciled = false;

export const connect = async (): Promise<Mongoose> => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL, {
      dbName: "hospital",
      bufferCommands: false,
      connectTimeoutMS: 30000,
    });
  }

  cached.conn = await cached.promise;

  if (!userIndexesReconciled) {
    const { reconcileUserIndexes } = await import("@/lib/reconcile-user-indexes");
    await reconcileUserIndexes(cached.conn);
    userIndexesReconciled = true;
  }

  return cached.conn;
};
