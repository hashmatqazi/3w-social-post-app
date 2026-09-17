import { useAuth } from "../context/AuthContext";
import { apiToggleLike } from "../utils/api";
import CommentSection from "./CommentSection";

const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

// Formats a date like "Aug 30, 2026"
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Single post card — handles like toggle and passes comment events up
export default function PostCard({ post, onLikeToggled, onCommentAdded }) {
  const { token, user, isLoggedIn } = useAuth();

  const hasLiked = user
    ? post.likes.some((l) => l.username === user.username)
    : false;

  const handleLike = async () => {
    if (!isLoggedIn) return;
    const { ok, data } = await apiToggleLike(token, post._id);
    if (ok) onLikeToggled(post._id, data.likes);
  };

  // Build the image src: if it starts with /uploads it's from our server
  const imageSrc = post.image
    ? post.image.startsWith("http")
      ? post.image
      : `${API_BASE}${post.image}`
    : null;

  return (
    <div className="post-card">
      {/* Post header */}
      <div className="post-header">
        <div className="avatar-circle post-avatar">
          {post.username?.[0]?.toUpperCase()}
        </div>
        <div className="post-meta">
          <span className="post-username">@{post.username}</span>
          <span className="post-date">{formatDate(post.createdAt)}</span>
        </div>
      </div>

      {/* Post body */}
      {post.text && <p className="post-text">{post.text}</p>}

      {imageSrc && (
        <img src={imageSrc} alt="Post" className="post-image" />
      )}

      {/* Actions row */}
      <div className="post-actions">
        <button
          className={`btn-like ${hasLiked ? "liked" : ""}`}
          onClick={handleLike}
          title={isLoggedIn ? (hasLiked ? "Unlike" : "Like") : "Login to like"}
        >
          {hasLiked ? "❤️" : "🤍"} {post.likes.length}
        </button>
      </div>

      {/* Comments */}
      <CommentSection
        postId={post._id}
        comments={post.comments}
        onCommentAdded={onCommentAdded}
      />
    </div>
  );
}
