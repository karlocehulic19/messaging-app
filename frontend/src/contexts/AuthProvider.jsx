import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { config } from "../Constants";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("site") || "");

  const navigate = useNavigate();

  const loginAction = async (username, password) => {
    const response = await fetch(`${config.url.BACKEND_URL}/login`, {
      method: "post",
      body: JSON.stringify({ username, password }),
    });

    if (response.status !== 200 && response.status !== 401) {
      throw new Error(
        `Error while fetching: ${response.url} - ${response.status}: ${
          (await response.text()) || response.statusText
        }`
      );
    }

    const res = await response.json();

    if (res.token) {
      localStorage.setItem("site", `Bearer ${res.token}`);
      setUser(res.user);
      setToken("randomJWTtoken");
    }

    if (res.messages) return res.messages;
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("site");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loginAction, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default AuthProvider;
