const jwt = require("jsonwebtoken");
const db = require("../config/db");

const SECRET_KEY = "OnFvWsD8DhCKCt7repgWCaAw5RQRAFH7"; // Replace with a strong secret key

const authenticate = async (req, res, next) => {
  let token = req.headers.authorization;

  token = token?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token missing" });
  }

  try {
    // Verify the JWT token
    const decodedToken = jwt.verify(token, SECRET_KEY);

    // Attach user information to the request object
    req.userId = decodedToken.userId;
    req.username = decodedToken.username;

    // Check if the user exists in the database (optional)
    const [user] = await db
      .promise()
      .query("SELECT * FROM users WHERE user_id = ?", [decodedToken.userId]);

    if (user.length === 0) {
      return res.status(401).json({ error: "Unauthorized: Invalid user" });
    }

    next();
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = authenticate;
