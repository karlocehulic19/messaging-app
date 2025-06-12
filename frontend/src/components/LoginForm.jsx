import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import PropTypes from "prop-types";
import styles from "./styles/LoginForm.module.css";
import apiErrorLogger from "../utils/apiErrorLogger";
import { DEMO_USER_PASSWORD, DEMO_USER_USERNAME } from "../Constants";
import LoadingButton from "./LoadingButton";

function LoginForm({ callback }) {
  const [emptyErrors, setEmptyErrors] = useState({});
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [buttonsLoading, setButtonsLoading] = useState({
    login: false,
    demo: false,
  });
  const [error, setError] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const { loginAction } = useAuth();

  const login = async (username, password) => {
    try {
      const messages = await loginAction(username, password);
      if (!messages) return callback();
      setLoginMessage(messages[0]);
    } catch (error) {
      apiErrorLogger(error);
      setError("Error occurred: Please try again!");
    }
  };

  async function handleFormSubmit(e) {
    e.preventDefault();
    setEmptyErrors((prev) => ({ ...prev, username: !username.length }));
    setEmptyErrors((prev) => ({ ...prev, password: !password.length }));

    if (password.length && username.length) {
      setButtonsLoading((prev) => ({ ...prev, login: true }));
      await login(username, password);
      setButtonsLoading((prev) => ({ ...prev, login: false }));
    }
  }

  async function handleDemoButtonClick() {
    setUsername(DEMO_USER_USERNAME);
    setPassword(DEMO_USER_PASSWORD);

    setButtonsLoading((prev) => ({ ...prev, demo: true }));
    await login(DEMO_USER_USERNAME, DEMO_USER_PASSWORD);
    setButtonsLoading((prev) => ({ ...prev, demo: true }));
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
          onChange={(e) => setUsername(e.target.value)}
          value={username}
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
          value={password}
          type="password"
          name="password"
          id="password"
          aria-label="Password input"
          placeholder="Password"
        />
        <LoadingButton
          loading={buttonsLoading.login}
          customProps={{ type: "submit" }}
        >
          Login
        </LoadingButton>
        <LoadingButton
          loading={buttonsLoading.demo}
          customProps={{
            type: "button",
            onClick: handleDemoButtonClick,
          }}
        >
          Continue as Demo User
        </LoadingButton>
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
