import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiAddComment } from "../utils/api";

// Collapsible comment list + add-comment input for one post
export default function CommentSection({ postId, comments, onCommentAdded }) {
  const { token, isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    const { ok, data } = await apiAddComment(token, postId, text.trim());
    setLoading(false);

    if (!ok) {
      setError(data.message || "Failed to add comment");
      return;
    }

    // Instantly add comment to UI without refetch
    onCommentAdded(postId, data.comment);
    setText("");
    setOpen(true); // keep comments visible after posting
  };

  return (
    <div className="comment-section">
      {/* Toggle button shows comment count */}
      <button
        className="btn-comment-toggle"
        onClick={() => setOpen((prev) => !prev)}
      >
        💬 {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </button>

      {open && (
        <div className="comment-list">
          {comments.length === 0 && (
            <p className="no-comments">No comments yet. Be the first!</p>
          )}
          {comments.map((c) => (
            <div key={c._id} className="comment-item">
              <div className="comment-avatar">
                {c.username?.[0]?.toUpperCase()}
              </div>
              <div className="comment-body">
                <span className="comment-username">{c.username}</span>
                <span className="comment-text">{c.text}</span>
              </div>
            </div>
          ))}

          {/* Add comment input — only shown when logged in */}
          {isLoggedIn && (
            <form className="comment-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Write a comment…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={300}
              />
              <button type="submit" disabled={loading || !text.trim()}>
                {loading ? "…" : "Send"}
              </button>
            </form>
          )}

          {error && <p className="comment-error">{error}</p>}
        </div>
      )}
    </div>
  );
}
