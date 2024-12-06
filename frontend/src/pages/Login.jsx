import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";

function Login() {
  const navigate = useNavigate();

  function handleRegisterRedirect() {
    navigate("/register");
  }

  return (
    <>
      <h1>Login</h1>
      <LoginForm />
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
