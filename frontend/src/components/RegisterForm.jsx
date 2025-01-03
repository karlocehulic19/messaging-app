import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import RegistrationValidator from "../utils/RegistrationValidator";
import useValidator from "../hooks/useValidator";
import ProfilePictureSelector from "./ProfilePictureSelector";
import RegisterFormInputs from "./RegisterFormInputs";
import ErrorPopup from "./ErrorPopup";
import { config } from "../Constants";

function RegisterForm() {
  const navigate = useNavigate();
  const [toggleError, setToggleError] = useState(false);
  const { formData, changeFormData, validationErrors, syncValidate } =
    useValidator(RegistrationValidator);

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await fetch(`${config.url.BACKEND_URL}/register`, {
      method: "POST",
    });
    if (!response.ok && response.status != 422) {
      return setToggleError(true);
    }

    changeFormData(e.target.id, e.target.value);
    if (await syncValidate(formData)) navigate("/login");
  }

  return (
    <>
      <ErrorPopup
        onClose={useCallback(() => setToggleError(false), [])}
        toggle={toggleError}
        text="An error occurred. Please try again."
      />
      <form noValidate onSubmit={handleSubmit} aria-label="Login form">
        <RegisterFormInputs
          validationErrors={validationErrors}
          changeFormData={changeFormData}
          formData={formData}
        />
        <ProfilePictureSelector />
        <button type="submit">Register</button>
      </form>
    </>
  );
}

export default RegisterForm;
