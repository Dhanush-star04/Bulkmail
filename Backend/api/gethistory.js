import mongoose from "mongoose";

let conn = null;

async function connectDB() {
  if (conn) return conn;
  conn = await mongoose.connect(
    "mongodb://ac-pmidgsj-shard-00-00.rgsexau.mongodb.net:27017,ac-pmidgsj-shard-00-01.rgsexau.mongodb.net:27017,ac-pmidgsj-shard-00-02.rgsexau.mongodb.net:27017/bulkmail?tls=true&replicaSet=atlas-12cd2z-shard-0&authSource=admin&retryWrites=true&w=majority",
    {
      auth: {
        username: "ramrdhanush2003_db_user",
        password: "FYkXvMVzwINi94mC",
      },
    }
  );
  return conn;
}

const Email = mongoose.models.emailContent || mongoose.model(
  "emailContent",
  new mongoose.Schema({}, { strict: false }),
  "emailContent"
);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await connectDB();
    const emailHistory = await Email.find();
    res.status(200).json(emailHistory);
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({
      error: "Failed to fetch email history",
    });
  }
}