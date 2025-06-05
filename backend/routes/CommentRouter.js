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

// POST /commentsOfPhoto/:photo_id/:comment_id/reply - Add a reply to a comment
router.post("/commentsOfPhoto/:photo_id/:comment_id/reply", async (req, res) => {
  const photoId = req.params.photo_id;
  const commentId = req.params.comment_id;
  const replyText = req.body.comment;
  const userId = req.session.user._id;

  if (!replyText) {
    return res.status(400).json({ error: "Reply text cannot be empty" });
  }

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    // Find the comment in the photo's comments array
    const comment = photo.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Add the reply to the comment's replies array
    comment.replies.push({
      comment: replyText,
      date_time: new Date(),
      user_id: userId
    });

    await photo.save();

    // Fetch the updated photo with populated user information
    const updatedPhoto = await Photo.findById(photoId).populate({
      path: "comments.user_id comments.replies.user_id",
      select: "_id first_name last_name"
    });

    // Find the updated comment and get the last reply
    const updatedComment = updatedPhoto.comments.id(commentId);
    const addedReply = updatedComment.replies[updatedComment.replies.length - 1];

    res.status(201).json(addedReply);

  } catch (err) {
    console.error("Error adding reply:", err);
    res.status(500).json({ error: "Server error adding reply" });
  }
});

// GET /commentsOfPhoto/:photo_id - Get all comments for a photo
router.get("/commentsOfPhoto/:photo_id", async (req, res) => {
  const photoId = req.params.photo_id;

  try {
    const photo = await Photo.findById(photoId).populate({
      path: "comments.user_id comments.replies.user_id",
      select: "_id first_name last_name"
    });

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    res.json(photo.comments);
  } catch (err) {
    console.error("Error getting comments:", err);
    res.status(500).json({ error: "Server error getting comments" });
  }
});

module.exports = router; 