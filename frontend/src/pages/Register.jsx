import RegisterForm from "../components/RegisterForm";
import { useNavigate } from "react-router-dom";
import styles from "./styles/Register.module.css";

function Register() {
  const navigate = useNavigate();

  function handleLoginRedirect() {
    navigate("/login");
  }

  return (
    <div className={styles["register-container"]}>
      <h1>Register</h1>
      <RegisterForm></RegisterForm>
      <span>
        Already have an account? Login{" "}
        <a onClick={handleLoginRedirect} aria-label="Link to login">
          HERE
        </a>
      </span>
    </div>
  );
}

export default Register;
