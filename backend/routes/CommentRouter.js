const express = require("express");
const router = express.Router();
const Photo = require("../db/photoModel");

// Authentication middleware (copying from UserRouter for now, consider a common file later)
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Apply authentication middleware to all comment routes
router.use(isAuthenticated);

// POST /commentsOfPhoto/:photo_id - Add a comment to a photo
router.post("/commentsOfPhoto/:photo_id", async (req, res) => {
  const photoId = req.params.photo_id;
  const commentText = req.body.comment;
  const userId = req.session.user._id; // Get user ID from session

  if (!commentText) {
    return res.status(400).json({ error: "Comment text cannot be empty" });
  }

  try {
    const photo = await Photo.findById(photoId);

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    const newComment = {
      comment: commentText,
      date_time: new Date(),
      user_id: userId,
    };

    photo.comments.push(newComment);
    await photo.save();

    // To return the user's first and last name in the new comment, 
    // we need to populate the user_id field of the newly added comment.
    // We can fetch the updated photo and populate the last comment.
    const updatedPhoto = await Photo.findById(photoId).populate({
        path: "comments.user_id",
        select: "_id first_name last_name"
      });
    
    const addedComment = updatedPhoto.comments[updatedPhoto.comments.length - 1];

    res.status(201).json(addedComment); // Return the newly added comment

  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: "Server error adding comment" });
  }
});

module.exports = router; 