import mongoose from "mongoose";

const uri = "mongodb+srv://ramrdhanush2003_db_user:04082003@cluster0.rgsexau.mongodb.net/passkey?appName=Cluster0";

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
})
  .then(() => console.log("✅ Connected!"))
  .catch(err => console.log("❌ Error:", err.message));