const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "OnFvWsD8DhCKCt7repgWCaAw5RQRAFH7"; // Replace with a strong secret key

// User Authentication Logic
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate user credentials
    const [user] = await db
      .promise()
      .query("SELECT * FROM users WHERE username = ?", [username]);

    if (user.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Compare password hashes
    const passwordMatch = await bcrypt.compare(password, user[0].password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    // Generate JWT token
    const token = jwt.sign(
      { userId: user[0].user_id, username: user[0].username },
      SECRET_KEY,
      { expiresIn: "7d" }
    );
    user.password_hash = "";
    res.json({ token, user: user[0] });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username is already taken
    const [existingUser] = await db
      .promise()
      .query("SELECT * FROM users WHERE username = ?", [username]);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user in the database
    await db
      .promise()
      .query("INSERT INTO users (username, password_hash) VALUES (?, ?)", [
        username,
        hashedPassword,
      ]);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
