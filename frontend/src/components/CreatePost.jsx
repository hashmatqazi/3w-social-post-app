import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { apiCreatePost } from "../utils/api";

// Form for creating a new post — supports text, image file, or both
export default function CreatePost({ onPostCreated, onToast }) {
  const { token, user } = useAuth();
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Show local preview when user picks a file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim() && !imageFile) {
      onToast("Please add some text or pick an image", "error");
      return;
    }

    setLoading(true);
    const { ok, data } = await apiCreatePost(token, text.trim(), imageFile);
    setLoading(false);

    if (!ok) {
      onToast(data.message || "Failed to create post", "error");
      return;
    }

    // Reset form
    setText("");
    removeImage();
    onPostCreated(data.post);
    onToast("Post shared!", "success");
  };

  return (
    <div className="create-post-card">
      <div className="create-post-header">
        <div className="avatar-circle">
          {user?.username?.[0]?.toUpperCase() || "U"}
        </div>
        <span className="create-post-label">What's on your mind?</span>
      </div>

      <form onSubmit={handleSubmit} className="create-post-form">
        <textarea
          placeholder={`Share something, ${user?.username}...`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />

        {/* Image preview */}
        {imagePreview && (
          <div className="image-preview-wrapper">
            <img src={imagePreview} alt="Preview" className="image-preview" />
            <button
              type="button"
              className="remove-image-btn"
              onClick={removeImage}
              title="Remove image"
            >
              ✕
            </button>
          </div>
        )}

        <div className="create-post-actions">
          {/* Hidden file input triggered by the 📷 button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="image-upload"
          />
          <label htmlFor="image-upload" className="btn-icon" title="Add photo">
            📷 Photo
          </label>

          <button
            type="submit"
            className="btn-post"
            disabled={loading}
          >
            {loading ? "Posting…" : "▶ Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
