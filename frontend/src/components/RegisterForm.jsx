import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import RegistrationValidator from "../utils/RegistrationValidator";
import useValidator from "../hooks/useValidator";
import ProfilePictureSelector from "./ProfilePictureSelector";
import RegisterFormInputs from "./RegisterFormInputs";
import ErrorPopup from "./ErrorPopup";
import customFetch from "../utils/customFetch";
import useFirstRender from "../hooks/useFirstRender";
import { isEmpty } from "lodash";

function RegisterForm() {
  const navigate = useNavigate();
  const firstRender = useFirstRender();
  const [loading, setLoading] = useState(false);
  const [serverValidationErrors, setServerValidationErrors] = useState([]);
  const toggleErrorPopup = useRef(() => null);
  const { formData, changeFormData, validationErrors } = useValidator(
    RegistrationValidator
  );

  console.log(formData);
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      await customFetch("/register", {
        method: "POST",
        body: JSON.stringify({ ...formData, passwordConf: undefined }),
      });

      navigate("/login");
    } catch (error) {
      if (error.response?.status == 422) {
        return setServerValidationErrors((await error.response.json()).message);
      }
      toggleErrorPopup.current?.toggle();
      if (!error.response) {
        return console.log(error.message);
      }
      console.log((await error.response.json()).error || error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ErrorPopup
        text="An error occurred. Please try again."
        ref={toggleErrorPopup}
      />
      <form noValidate onSubmit={handleSubmit} aria-label="Login form">
        {!!serverValidationErrors.length && (
          <div className="server-validation-errors">
            {serverValidationErrors.map((err) => (
              <p key={err}>{err}</p>
            ))}
          </div>
        )}
        <RegisterFormInputs
          validationErrors={validationErrors}
          changeFormData={changeFormData}
          formData={formData}
        />
        <ProfilePictureSelector />
        <button
          disabled={firstRender || loading || !isEmpty(validationErrors)}
          type="submit"
        >
          Register
        </button>
      </form>
    </>
  );
}

export default RegisterForm;
