const express = require("express");

const {
  createPost,
  getPosts,
  toggleLike,
  addComment,
  deletePost,
} = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Create post - login required
router.post("/", authMiddleware, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, createPost);

router.post("/:id/like", authMiddleware, toggleLike);

// Add comment - login required
router.post("/:id/comments", authMiddleware, addComment);

// Delete post - login required
router.delete("/:id", authMiddleware, deletePost);

// Get all posts - public
router.get("/", getPosts);

module.exports = router;