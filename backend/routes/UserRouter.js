const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// router.post("/", async (request, response) => {
//
// });

router.get("/", async (request, response) => {
  
});

// Get list of users for navigation sidebar
router.get("/list", async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Get detailed user information
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "Invalid user ID" });
  }
});

// POST /user - Register a new user
router.post('/', async (req, res) => {
  console.log('Received POST request to /api/user (registration)');
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;

  // Basic validation
  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Required fields are missing (login_name, password, first_name, last_name).' });
  }

  try {
    // Check if login_name already exists
    const existingUser = await User.findOne({ login_name: login_name });
    if (existingUser) {
      return res.status(400).json({ error: 'Login name already exists.' });
    }

    // Create new user
    const newUser = new User({
      login_name: login_name,
      password: password, // Store password directly for now (will enhance with hashing later)
      first_name: first_name,
      last_name: last_name,
      location: location,
      description: description,
      occupation: occupation,
    });

    await newUser.save();

    // Return necessary user properties
    res.status(201).json({ _id: newUser._id, login_name: newUser.login_name });

  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

module.exports = router;