import RegisterForm from "../components/RegisterForm";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  function handleLoginRedirect() {
    navigate("/login");
  }

  return (
    <>
      <h1>Register</h1>
      <RegisterForm></RegisterForm>
      <span>
        Already have an account? Login{" "}
        <a onClick={handleLoginRedirect} aria-label="Link to login">
          HERE
        </a>
      </span>
    </>
  );
}

export default Register;
