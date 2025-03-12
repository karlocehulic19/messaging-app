import PropTypes from "prop-types";
import UpdateValidator from "../utils/UpdateValidator";
import useValidator from "../hooks/useValidator";
import { useEffect } from "react";
import styles from "./styles/UpdateFormInputs.module.css";

export default function UpdateFormInputs({
  infoState,
  username,
  email,
  handleInputChange,
}) {
  const { validationErrors, changeFormData } = useValidator(UpdateValidator);
  const isUsernameInvalid =
    infoState == "editing" && !!validationErrors.username;
  const isEmailInvalid = infoState == "editing" && !!validationErrors.email;

  useEffect(() => {
    changeFormData("username", username);
    changeFormData("email", email);
  }, [username, email, changeFormData]);

  return (
    <>
      <label htmlFor="username">Username: </label>
      <div className={styles["input-container"]}>
        {isUsernameInvalid && (
          <span
            className={styles["validation-error"]}
            aria-label="Username input error"
          >
            {validationErrors.username}
          </span>
        )}
        <input
          value={username}
          onChange={handleInputChange}
          className={isUsernameInvalid ? styles["invalid-input"] : null}
          type="text"
          name="username"
          id="username"
          aria-label="Username input"
        />
      </div>

      <label htmlFor="email">Email: </label>
      <div className={styles["input-container"]}>
        {isEmailInvalid && (
          <span
            className={styles["validation-error"]}
            aria-label="Email input error"
          >
            {validationErrors.email}
          </span>
        )}
        <input
          value={email}
          onChange={handleInputChange}
          className={isEmailInvalid ? styles["invalid-input"] : null}
          type="email"
          name="email"
          id="email"
          aria-label="Email input"
        />
      </div>
    </>
  );
}
UpdateFormInputs.propTypes = {
  username: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  infoState: PropTypes.oneOf(["loading", "editing"]),
};
