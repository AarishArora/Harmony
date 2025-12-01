import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

export default function GoogleCallback() {

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      window.dispatchEvent(new Event('authChange'));

      window.location.href = "/";
    } else {
      window.location.href = "/login";
    }
  }, []);

  return <div>Logging you in...</div>;
}
