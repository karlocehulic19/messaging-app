import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import styles from "./styles/Login.module.css";

function Login() {
  const navigate = useNavigate();

  function handleRegisterRedirect() {
    navigate("/register");
  }

  return (
    <div className={styles["login-container"]}>
      <h1 className={styles["login-header"]}>Login</h1>
      <LoginForm callback={() => navigate("/")} />
      <span>
        You don&apos;t have an account? Register here:{" "}
        <a role="link" onClick={handleRegisterRedirect}>
          HERE
        </a>
      </span>
    </div>
  );
}

export default Login;
