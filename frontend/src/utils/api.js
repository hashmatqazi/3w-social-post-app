const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper: attach Authorization header when token is present
function authHeaders(token, isMultipart = false) {
  const headers = {};
  if (!isMultipart) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// --- Auth ---

export async function apiSignup(username, email, password) {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: authHeaders(null),
    body: JSON.stringify({ username, email, password }),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
}

export async function apiLogin(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: authHeaders(null),
    body: JSON.stringify({ email, password }),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
}

// --- Posts ---

// Fetch paginated posts: GET /api/posts?page=N&limit=10
export async function apiGetPosts(page = 1) {
  const res = await fetch(`${BASE_URL}/posts?page=${page}&limit=10`);
  return res.json().then((data) => ({ ok: res.ok, data }));
}

// Create post with optional image file upload (multipart)
export async function apiCreatePost(token, text, imageFile) {
  const formData = new FormData();
  if (text) formData.append("text", text);
  if (imageFile) formData.append("image", imageFile);

  const res = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: authHeaders(token, true), // no Content-Type so browser sets multipart boundary
    body: formData,
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
}

// Toggle like on a post
export async function apiToggleLike(token, postId) {
  const res = await fetch(`${BASE_URL}/posts/${postId}/like`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
}

// Add comment to a post
export async function apiAddComment(token, postId, text) {
  const res = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ text }),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
}
