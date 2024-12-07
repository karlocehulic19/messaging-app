import { useState } from "react";
import { config } from "../Constants";

function LoginForm({ callback }) {
  const [emptyErrors, setEmptyErrors] = useState({});
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleFormSubmit(e) {
    e.preventDefault();
    setEmptyErrors((prev) => ({ ...prev, username: !username.length }));
    setEmptyErrors((prev) => ({ ...prev, password: !password.length }));

    if (password.length && username.length) {
      setLoading(true);
      await fetch(`${config.url.BACKEND_URL}/login`, {
        method: "post",
        body: JSON.stringify({ username, password }),
        headers: {
          "content-type": "application/json",
        },
      })
        .then(async (response) => {
          if (response.status !== 401 && response.status !== 200) {
            throw new Error(
              `Error while fetching: ${response.url} - ${response.status}: ${
                (await response.text()) || response.statusText
              }`
            );
          }
          if (response.status == 200) callback();
        })
        .catch((err) => {
          setError(true);
          console.log(err);
        });
      setLoading(false);
    }
  }

  function handleInput(e) {
    setUsername(e.target.value);
  }

  return (
    <>
      <form noValidate aria-label="Login form" onSubmit={handleFormSubmit}>
        <label htmlFor="username">Username: </label>
        {emptyErrors.username && <span>Username can&apos;t be empty</span>}
        <input
          onChange={handleInput}
          type="text"
          name="username"
          id="username"
          aria-label="Username input"
          required
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
        {!loading ? (
          <button type="submit">Login</button>
        ) : (
          <button disabled>Loading...</button>
        )}
      </form>
      {error && (
        <div data-testid="login-server-error">
          Error occurred: Please try again!
        </div>
      )}
    </>
  );
}

export default LoginForm;
