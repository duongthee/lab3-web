const express = require("express");
const session = require("express-session");
const app = express();
const cors = require("cors");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const CommentRouter = require("./routes/CommentRouter");
const path = require('path'); // Import the path module
const User = require("./db/userModel");

dbConnect();

// Serve static files from the 'images' directory
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(cors());
app.use(express.json());
app.use(session({
  secret: "your-secret-key", // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using https
}));

// Login endpoint
app.post("/admin/login", async (req, res) => {
  const { login_name, password } = req.body;

  if (!login_name || !password) {
    return res.status(400).json({ error: "Login name and password are required" });
  }

  try {
    const user = await User.findOne({ login_name: login_name });

    if (!user || user.password !== password) { // Check password
      return res.status(400).json({ error: "Invalid login name or password" });
    }

    // Store user info in session (only store necessary info)
    req.session.user = { _id: user._id, first_name: user.first_name };

    // Return user properties needed by the app (at least _id)
    res.json({ _id: user._id, first_name: user.first_name, last_name: user.last_name });

  } catch (err) {
    console.error("Server error during login:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Logout endpoint
app.post("/admin/logout", (req, res) => {
  if (req.session && req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Error logging out" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  } else {
    res.status(400).json({ error: "No user is currently logged in" });
  }
});

app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.use("/api/comment", CommentRouter);

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
