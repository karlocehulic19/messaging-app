import { useNavigate } from "react-router-dom";
import RegistrationValidator from "../utils/RegistrationValidator";
import useValidator from "../hooks/useValidator";
import ProfilePictureSelector from "./ProfilePictureSelector";
import RegisterFormInputs from "./RegisterFormInputs";

function RegisterForm() {
  const navigate = useNavigate();
  const { formData, changeFormData, validationErrors, syncValidate } =
    useValidator(RegistrationValidator);

  async function handleSubmit(e) {
    e.preventDefault();

    changeFormData(e.target.id, e.target.value);
    if (await syncValidate(formData)) navigate("/login");
  }

  return (
    <form noValidate onSubmit={handleSubmit} aria-label="Login form">
      <RegisterFormInputs
        validationErrors={validationErrors}
        changeFormData={changeFormData}
        formData={formData}
      />
      <ProfilePictureSelector />
      <button type="submit">Register</button>
    </form>
  );
}

export default RegisterForm;
