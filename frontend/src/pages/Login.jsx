import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const [emptyErrors, setEmptyErrors] = useState({ username: false });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!username) {
      setEmptyErrors((prev) => ({ ...prev, username: true }));
    }
    if (!password) {
      setEmptyErrors((prev) => ({ ...prev, password: true }));
    }
  }

  function handleRegisterRedirect() {
    navigate("/register");
  }

  return (
    <>
      <h1>Login</h1>
      <form aria-label="Login form" onSubmit={handleFormSubmit}>
        <label htmlFor="username">Username: </label>
        {emptyErrors.username && <span>Username can&apos;t be empty</span>}
        <input
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          type="text"
          name="username"
          id="username"
          aria-label="Username input"
        />
        <label htmlFor="username">Password: </label>
        {emptyErrors.password && <span>Password can&apos;t be empty</span>}
        <input
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          type="password"
          name="password"
          id="password"
          aria-label="Password input"
        />
        <button type="submit">Login</button>
      </form>
      <span>
        You don&apos;t have an account? Register here:{" "}
        <a role="link" onClick={handleRegisterRedirect}>
          HERE
        </a>
      </span>
    </>
  );
}

export default Login;
