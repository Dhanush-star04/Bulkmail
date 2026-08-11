const VALID_LOGINS = [
  { username: "Dhanush", password: "123" },
  { username: "test1@gmail.com", password: "1234" },
];

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

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
}