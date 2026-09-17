import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isLoggedIn } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="navbar-logo">🌐 3W Social</span>
        {isLoggedIn && (
          <div className="navbar-right">
            <span className="navbar-user">👤 {user?.username}</span>
            <button className="btn-logout" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
