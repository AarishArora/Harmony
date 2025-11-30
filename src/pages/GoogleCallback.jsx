import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      // Dispatch custom event to notify Navbar of auth change
      window.dispatchEvent(new Event('authChange'));
      // Clean up URL and navigate to home
      window.history.replaceState({}, document.title, "/");
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <div>Logging you in...</div>;
}
