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

const credential = mongoose.models.credential || mongoose.model(
  "credential",
  new mongoose.Schema({}, { strict: false }),
  "passkey"
);

const Email = mongoose.models.emailContent || mongoose.model(
  "emailContent",
  new mongoose.Schema({}, { strict: false }),
  "emailContent"
);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { subject, message, emailList } = req.body;

  try {
    if (!subject || !message || !emailList || !emailList.length) {
      return res.status(400).json({
        error: "Subject, message and email list are required",
      });
    }

    await connectDB();

    const data = await credential.find();

    if (!data.length) {
      return res.status(500).json({
        error: "No Brevo credentials found in passkey collection",
      });
    }

    const { apiKey, senderEmail } = data[0];

    if (!apiKey || !senderEmail) {
      return res.status(500).json({
        error: "passkey collection needs apiKey and senderEmail fields",
      });
    }

    for (let i = 0; i < emailList.length; i++) {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          sender: { email: senderEmail },
          to: [{ email: emailList[i] }],
          subject: subject,
          textContent: message,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Failed to send to ${emailList[i]}:`, errText);
      } else {
        console.log(`Email sent to: ${emailList[i]}`);
      }
    }

    await Email.create({
      subject: subject,
      emailList: emailList,
      body: message,
      time: new Date(),
    });

    res.status(200).json({
      message: "Emails sent successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      error: "Failed to send email",
    });
  }
}