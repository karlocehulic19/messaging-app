import PropTypes from "prop-types";
import UpdateValidator from "../utils/UpdateValidator";
import useValidator from "../hooks/useValidator";
import { useEffect } from "react";

export default function UpdateFormInputs({
  username,
  email,
  handleInputChange,
}) {
  const { validationErrors, changeFormData } = useValidator(UpdateValidator);

  useEffect(() => {
    changeFormData("username", username);
    changeFormData("email", email);
  }, [username, email, changeFormData]);

  return (
    <>
      {validationErrors.username && (
        <span aria-label="Username input error">
          {validationErrors.username}
        </span>
      )}
      <input
        value={username}
        onChange={handleInputChange}
        type="text"
        name="username"
        id="username"
        aria-label="Username input"
      />
      {validationErrors.email && (
        <span aria-label="Email input error">{validationErrors.email}</span>
      )}
      <input
        value={email}
        onChange={handleInputChange}
        type="email"
        name="email"
        id="email"
        aria-label="Email input"
      />
    </>
  );
}
UpdateFormInputs.propTypes = {
  username: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};
