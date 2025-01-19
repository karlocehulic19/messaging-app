import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import PropTypes from "prop-types";
import styles from "./styles/LoginForm.module.css";

function LoginForm({ callback }) {
  const [emptyErrors, setEmptyErrors] = useState({});
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");

  const { loginAction } = useAuth();

  async function handleFormSubmit(e) {
    e.preventDefault();
    setEmptyErrors((prev) => ({ ...prev, username: !username.length }));
    setEmptyErrors((prev) => ({ ...prev, password: !password.length }));

    if (password.length && username.length) {
      setLoading(true);
      try {
        const messages = await loginAction(username, password);
        if (!messages) return callback();
        setLoginMessage(messages[0]);
      } catch (error) {
        console.log(error);
        setError("Error occurred: Please try again!");
      }

      setLoading(false);
    }
  }

  function handleInput(e) {
    setUsername(e.target.value);
  }

  return (
    <>
      <form
        className={styles["login-form"]}
        noValidate
        aria-label="Login form"
        onSubmit={handleFormSubmit}
      >
        {!!loginMessage.length && (
          <span aria-label="Login message">{loginMessage}</span>
        )}
        {emptyErrors.username && <span>Username can&apos;t be empty</span>}
        <input
          onChange={handleInput}
          type="text"
          name="username"
          id="username"
          aria-label="Username input"
          placeholder="Username"
          required
        />
        {emptyErrors.password && <span>Password can&apos;t be empty</span>}
        <input
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          type="password"
          name="password"
          id="password"
          aria-label="Password input"
          placeholder="Password"
        />
        {!loading ? (
          <button type="submit">Login</button>
        ) : (
          <button disabled>Loading...</button>
        )}
      </form>
      {error && (
        <div data-testid="login-server-error" className="error-popup">
          Error occurred: Please try again!
        </div>
      )}
    </>
  );
}

LoginForm.propTypes = {
  callback: PropTypes.func.isRequired,
};

export default LoginForm;
