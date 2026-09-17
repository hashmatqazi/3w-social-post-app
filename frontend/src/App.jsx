import { FaSearch, FaCamera, FaSmile, FaBars, FaBullhorn, FaShare, FaEllipsisV, FaPlus } from "react-icons/fa";
import { useState, useEffect } from "react";
import "./App.css";
import { useAuth } from "./context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const { login, logout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState("");
  const [commentTexts, setCommentTexts] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [activeFilter, setActiveFilter] = useState("All Posts");
  const [showLogin, setShowLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [following, setFollowing] = useState(() => {
    const saved = localStorage.getItem("following");
    return saved ? JSON.parse(saved) : {};
  });
  const [openMenu, setOpenMenu] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenu({});
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_URL}/posts`);
        const data = await response.json();
        if (response.ok) setPosts(data.posts);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };
    fetchPosts();
  }, [isLoggedIn]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postText.trim() && !postImage) {
      alert("Please add text or an image");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      if (postText) formData.append("text", postText);
      if (postImage) formData.append("image", postImage);
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) { alert(data.message); return; }
      setPosts((prev) => [data.post, ...prev]);
      setPostText("");
      setPostImage(null);
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Unable to create post");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();
      if (!response.ok) { alert(data.message); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      login(data.token, data.user);
      setIsLoggedIn(true);
      alert("Login successful!");
    } catch (error) {
      alert("Unable to connect to server");
      console.error(error);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signupUsername,
          email: signupEmail,
          password: signupPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) { alert(data.message); return; }
      alert("Signup successful!");
      setSignupUsername("");
      setSignupEmail("");
      setSignupPassword("");
      setShowLogin(true);
    } catch (error) {
      alert("Unable to connect to server");
      console.error(error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) { alert(data.message); return; }
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, likes: data.likes } : post
        )
      );
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleComment = async (postId) => {
    if (!commentTexts[postId]?.trim()) { alert("Please enter a comment"); return; }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentTexts[postId] }),
      });
      const data = await response.json();
      if (!response.ok) { alert(data.message); return; }
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? { ...post, comments: [...post.comments, data.comment] }
            : post
        )
      );
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) { alert(data.message); return; }
      setPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const getSortedPosts = () => {
    return [...posts].sort((a, b) => {
      if (activeFilter === "Most Liked") return b.likes.length - a.likes.length;
      if (activeFilter === "Most Commented") return b.comments.length - a.comments.length;
      return 0;
    });
  };

  if (isLoggedIn) {
    return (
      <div className="app">
        <div className="navbar">
          <h2 className="nav-title">Social</h2>
          <div className="nav-right">
            <FaSearch color="#555" size={18} />
            <div className="avatar-icon">
              {JSON.parse(localStorage.getItem("user"))?.username?.[0]?.toUpperCase() || "👤"}
            </div>
          </div>
        </div>

        <div className="feed-container">
          <div className="create-post-card">
            <div className="create-post-top">
              <div className="user-avatar">
                {JSON.parse(localStorage.getItem("user"))?.username?.[0]?.toUpperCase() || "👤"}
              </div>
              <form onSubmit={handleCreatePost} className="create-post-form">
                <textarea
                  placeholder="What's on your mind?"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                />
                <div className="create-post-actions">
                  <label className="icon-btn" title="Add photo">
                    <FaCamera size={20} color="#1877f2" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPostImage(e.target.files[0])}
                      style={{ display: "none" }}
                    />
                  </label>
                  <div style={{ position: "relative" }}>
                    <FaSmile
                      size={20}
                      color="#1877f2"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEmojiPicker((prev) => !prev);
                      }}
                    />
                    {showEmojiPicker && (
                      <div className="emoji-picker">
                        {["😊","😂","❤️","👍","🔥","😍","🎉","😎","🙏","😢","😡","🤔","👏","💯","🥳","😅","🤣","💪","✨","🌟"].map((emoji) => (
                          <span
                            key={emoji}
                            onClick={() => {
                              setPostText((prev) => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                          >
                            {emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <FaBars
                    size={20}
                    color="#1877f2"
                    style={{ cursor: "pointer" }}
                    onClick={() => alert("Format options coming soon!")}
                  />
                  <span
                    className="promote-btn"
                    style={{ cursor: "pointer" }}
                    onClick={() => alert("Promote feature coming soon!")}
                  >
                    <FaBullhorn size={16} /> Promote
                  </span>
                  <button
                    className="logout-btn"
                    type="button"
                    onClick={() => {
                      logout();
                      setIsLoggedIn(false);
                      setShowLogin(true);
                    }}
                  >
                    Logout
                  </button>
                  <button
  type="submit"
  className="post-btn"
  style={{
    background: postText.trim() || postImage ? "#1877f2" : "#c8c8c8",
    cursor: postText.trim() || postImage ? "pointer" : "not-allowed",
  }}
>
  ▶ Post
</button>
                </div>
              </form>
            </div>
          </div>

          <div className="filter-tabs">
            {["All Posts", "Most Liked", "Most Commented"].map((tab) => (
              <button
                key={tab}
                className={`filter-tab ${activeFilter === tab ? "active" : ""}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="posts">
            {getSortedPosts().map((post) => (
              <div className="post-card" key={post._id}>
                <div className="post-header">
                  <div className="post-avatar">
                    {post.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="post-meta">
                    <span className="post-username">{post.username}</span>
                    <span className="post-date">
                      {new Date(post.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short",
                      })}
                    </span>
                  </div>
                  <button
                    className={`follow-btn ${following[post._id] ? "following" : ""}`}
                    onClick={() => {
                      setFollowing((prev) => {
                        const updated = {
                          ...prev,
                          [post._id]: !prev[post._id],
                        };
                        localStorage.setItem("following", JSON.stringify(updated));
                        return updated;
                      });
                    }}
                  >
                    {following[post._id] ? "Following" : "Follow"}
                  </button>
                  <div style={{ position: "relative" }}>
                    <FaEllipsisV
                      color="#888"
                      size={16}
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu((prev) => ({
                          ...prev,
                          [post._id]: !prev[post._id],
                        }));
                      }}
                    />
                    {openMenu[post._id] && (
                      <div
                        className="dropdown-menu"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p onClick={() => {
                          handleDeletePost(post._id);
                          setOpenMenu({});
                        }}>Delete Post</p>
                        <p onClick={() => {
                          alert("Post reported!");
                          setOpenMenu({});
                        }}>Report</p>
                        <p onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert("Link copied!");
                          setOpenMenu({});
                        }}>Copy Link</p>
                      </div>
                    )}
                  </div>
                </div>

                {post.text && <p className="post-text">{post.text}</p>}
                {post.image && (
                  <img
                    src={
                      post.image.startsWith("http")
                        ? post.image
                        : `http://localhost:5000${post.image}`
                    }
                    alt="Post"
                    className="post-image"
                  />
                )}

                <div className="post-actions">
                  <button className="like-btn" onClick={() => handleLike(post._id)}>
                    ❤️ {post.likes.length}
                  </button>
                  <button
                    className="comment-toggle"
                    onClick={() =>
                      setOpenComments((prev) => ({
                        ...prev,
                        [post._id]: !prev[post._id],
                      }))
                    }
                  >
                    💬 {post.comments.length}
                  </button>
                  <button
                    className="share-btn"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `Post by ${post.username}`,
                          text: post.text,
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link copied to share!");
                      }
                    }}
                  >
                    <FaShare size={14} />
                  </button>
                </div>

                {openComments[post._id] && (
                  <div className="comments">
                    {post.comments.length === 0 && (
                      <p style={{ color: "#aaa" }}>No comments yet.</p>
                    )}
                    {post.comments.map((comment) => (
                      <p key={comment._id}>
                        <strong>{comment.username}</strong>: {comment.text}
                      </p>
                    ))}
                  </div>
                )}

                <form
                  className="comment-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleComment(post._id);
                  }}
                >
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentTexts[post._id] || ""}
                      onChange={(e) =>
                        setCommentTexts((prev) => ({
                          ...prev,
                          [post._id]: e.target.value,
                        }))
                      }
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        fontSize: "18px",
                      }}
                      onClick={() =>
                        setOpenComments((prev) => ({
                          ...prev,
                          [`emoji_${post._id}`]: !prev[`emoji_${post._id}`],
                        }))
                      }
                    >
                      😊
                    </span>
                    {openComments[`emoji_${post._id}`] && (
                      <div className="emoji-picker" style={{ bottom: "40px", left: "0" }}>
                        {["😊","😂","❤️","👍","🔥","😍","🎉","😎","🙏","😢","😡","🤔","👏","💯","🥳","😅","🤣","💪","✨","🌟"].map((emoji) => (
                          <span
                            key={emoji}
                            onClick={() => {
                              setCommentTexts((prev) => ({
                                ...prev,
                                [post._id]: (prev[post._id] || "") + emoji,
                              }));
                              setOpenComments((prev) => ({
                                ...prev,
                                [`emoji_${post._id}`]: false,
                              }));
                            }}
                          >
                            {emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="submit">Send</button>
                </form>
              </div>
            ))}
          </div>

          <div className="fab">
            <FaPlus color="white" size={20} />
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="auth-container">
        <h1>3W Social</h1>
        <p className="subtitle">Connect, share and interact.</p>

        {showLogin ? (
          <>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button type="submit">Login</button>
            </form>
            <p>
              Don't have an account?{" "}
              <span onClick={() => setShowLogin(false)}>Sign up</span>
            </p>
          </>
        ) : (
          <>
            <h2>Sign Up</h2>
            <form onSubmit={handleSignup}>
              <input
                type="text"
                placeholder="Username"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
              />
              <button type="submit">Sign Up</button>
            </form>
            <p>
              Already have an account?{" "}
              <span onClick={() => setShowLogin(true)}>Login</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default App;