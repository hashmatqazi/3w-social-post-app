import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { apiGetPosts } from "../utils/api";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";

// Main social feed page with pagination
export default function FeedPage({ onToast }) {
  const { isLoggedIn } = useAuth();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all | mostLiked | mostCommented

  const fetchPosts = useCallback(async (pageNum = 1) => {
    setLoading(true);
    const { ok, data } = await apiGetPosts(pageNum);
    setLoading(false);

    if (!ok) {
      onToast("Failed to load posts", "error");
      return;
    }

    setPosts(data.posts);
    setPagination(data.pagination);
    setPage(pageNum);
  }, [onToast]);

  // Load posts on mount
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Prepend new post instantly after creation
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Update likes in place without refetching
  const handleLikeToggled = (postId, updatedLikes) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, likes: updatedLikes } : p))
    );
  };

  // Append new comment in place without refetching
  const handleCommentAdded = (postId, newComment) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      )
    );
  };

  // Client-side sort for filter tabs
  const displayedPosts = [...posts].sort((a, b) => {
    if (filter === "mostLiked") return b.likes.length - a.likes.length;
    if (filter === "mostCommented") return b.comments.length - a.comments.length;
    return 0; // "all" keeps server order (newest first)
  });

  const filters = [
    { key: "all", label: "All Posts" },
    { key: "mostLiked", label: "Most Liked" },
    { key: "mostCommented", label: "Most Commented" },
  ];

  return (
    <div className="feed-page">
      <div className="feed-container">
        {/* Create post — only visible when logged in */}
        {isLoggedIn && (
          <CreatePost onPostCreated={handlePostCreated} onToast={onToast} />
        )}

        {/* Filter tabs */}
        <div className="filter-tabs">
          {filters.map((f) => (
            <button
              key={f.key}
              className={`filter-tab ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Post list */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading posts…</p>
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="empty-state">
            <p>🌐 No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          <div className="posts-list">
            {displayedPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLikeToggled={handleLikeToggled}
                onCommentAdded={handleCommentAdded}
              />
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn-page"
              onClick={() => fetchPosts(page - 1)}
              disabled={!pagination.hasPrevPage || loading}
            >
              ← Prev
            </button>
            <span className="page-info">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className="btn-page"
              onClick={() => fetchPosts(page + 1)}
              disabled={!pagination.hasNextPage || loading}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
