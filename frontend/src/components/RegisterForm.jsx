import { useNavigate } from "react-router-dom";
import { useRef, useState, useCallback } from "react";
import RegistrationValidator from "../utils/RegistrationValidator";
import useValidator from "../hooks/useValidator";
import ProfilePictureSelector from "./ProfilePictureSelector";
import RegisterFormInputs from "./RegisterFormInputs";
import ErrorPopup from "./ErrorPopup";
import customFetch from "../utils/customFetch";
import useFirstRender from "../hooks/useFirstRender";
import { isEmpty } from "lodash";
import styles from "./styles/RegisterForm.module.css";

function RegisterForm() {
  const navigate = useNavigate();
  const firstRender = useFirstRender();
  const [loading, setLoading] = useState(false);
  const [serverValidationErrors, setServerValidationErrors] = useState([]);
  const toggleErrorPopup = useRef(() => null);
  const { formData, changeFormData, validationErrors } = useValidator(
    RegistrationValidator
  );
  const profPicBase64 = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      await customFetch("/register", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          passwordConf: undefined,
          pictureBase64: profPicBase64.current || undefined,
        }),
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
        <ProfilePictureSelector
          onImageSelect={useCallback((base64) => {
            profPicBase64.current = base64;
          }, [])}
        />
        <button
          aria-label="Submit Button"
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
