import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

const app = express();

app.use(cors());
app.use(express.json());


// ========================================
// MONGODB CONNECTION
// ========================================

mongoose
  .connect(
    "mongodb://ac-pmidgsj-shard-00-00.rgsexau.mongodb.net:27017,ac-pmidgsj-shard-00-01.rgsexau.mongodb.net:27017,ac-pmidgsj-shard-00-02.rgsexau.mongodb.net:27017/bulkmail?tls=true&replicaSet=atlas-12cd2z-shard-0&authSource=admin&retryWrites=true&w=majority",
    {
      auth: {
        username: "ramrdhanush2003_db_user",
        password: "FYkXvMVzwINi94mC",
      },
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB error:", error);
  });


// ========================================
// PASSKEY COLLECTION
// ========================================

const credential = mongoose.model(
  "credential",
  new mongoose.Schema({}, { strict: false }),
  "passkey"
);


// ========================================
// EMAIL HISTORY COLLECTION
// ========================================

const Email = mongoose.model(
  "emailContent",
  new mongoose.Schema({}, { strict: false }),
  "emailContent"
);


// ========================================
// SAVE EMAIL RECORD
// ========================================

async function sendEmailRecord(emailData) {
  try {
    const result = await Email.create(emailData);

    console.log("Email record saved:", result._id);
  } catch (error) {
    console.error("Can't save email:", error.message);
  }
}


// ========================================
// SEND EMAIL
// ========================================

app.post("/sendemail", async (req, res) => {

  const { subject, message, emailList } = req.body;

  try {

    if (!subject || !message || !emailList || !emailList.length) {
      return res.status(400).json({
        error: "Subject, message and email list are required",
      });
    }


    // Get Gmail credentials
    const data = await credential.find();

    if (!data.length) {
      return res.status(500).json({
        error: "No Gmail credentials found in passkey collection",
      });
    }


    const { user, pass } = data[0];


    if (!user || !pass) {
      return res.status(500).json({
        error: "Invalid Gmail credentials in passkey collection",
      });
    }


    // ========================================
    // NODEMAILER
    // ========================================

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: user,
        pass: pass,
      },
    });


    // ========================================
    // SEND EMAILS
    // ========================================

    for (let i = 0; i < emailList.length; i++) {

      await transporter.sendMail({
        from: user,
        to: emailList[i],
        subject: subject,
        text: message,
      });

      console.log(`Email sent to: ${emailList[i]}`);
    }


    console.log("All emails sent.");


    // ========================================
    // SAVE EMAIL HISTORY
    // ========================================

    await sendEmailRecord({
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

});


// ========================================
// GET EMAIL HISTORY
// ========================================

app.get("/gethistory", async (req, res) => {

  try {

    const emailHistory = await Email.find();

    res.status(200).json(emailHistory);

  } catch (error) {

    console.error("History error:", error);

    res.status(500).json({
      error: "Failed to fetch email history",
    });

  }

});


// ========================================
// LOGIN (hardcoded, no DB)
// ========================================

const VALID_LOGINS = [
  { username: "Dhanush", password: "123" },
  { username: "test1@gmail.com", password: "1234" },
];

app.post("/login", (req, res) => {

  const { email, password } = req.body;

  console.log("Login request:", email);

  if (!email || !password) {

    return res.status(400).json({
      message: "Email and password are required.",
    });

  }

  const match = VALID_LOGINS.find(
    (cred) => cred.username === email.trim() && cred.password === password.trim()
  );

  if (!match) {

    return res.status(401).json({
      message: "Invalid credentials.",
    });

  }

  console.log("Login successful");

  res.status(200).json({
    message: "Login successful",
  });

});


// ========================================
// START SERVER
// ========================================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});