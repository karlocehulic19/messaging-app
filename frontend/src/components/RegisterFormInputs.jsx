import PropTypes from "prop-types";
import RegistrationValidator from "../utils/RegistrationValidator";
import styles from "./styles/RegisterFormInputs.module.css";

class InputShortcut {
  constructor(name, password = false) {
    this.props = {
      name,
      id: name,
      type: "text",
      ["data-testid"]: !password ? undefined : "pw-input",
    };
  }
  addProp(prop, value) {
    this.props[prop] = value;

    return this;
  }
  getProps() {
    return this.props;
  }
  getField() {
    return this.props.name;
  }
  getPlaceholder() {
    if (!this.props.placeholder)
      throw new Error(`${this.getField()} doesn't have placeholder`);
    return this.props.placeholder;
  }
}

const defaultInputs = [
  new InputShortcut("username").addProp("placeholder", "Username"),
  new InputShortcut("email")
    .addProp("placeholder", "Email")
    .addProp("type", "email"),
  new InputShortcut("firstName").addProp("placeholder", "First Name"),
  new InputShortcut("lastName").addProp("placeholder", "Last Name"),
  new InputShortcut("password", true)
    .addProp("placeholder", "Password")
    .addProp("aria-label", "Password input")
    .addProp("type", "password"),
  new InputShortcut("passwordConf", true)
    .addProp("placeholder", "Confirm Password")
    .addProp("aria-label", "Password Confirmation input")
    .addProp("type", "password"),
];

function RegisterFormInputs({ validationErrors, changeFormData, formData }) {
  function handleInputChange(e) {
    changeFormData(e.target.id, e.target.value);
  }

  return (
    <>
      {defaultInputs.map((shortcut, index) => {
        return (
          <label
            data-testid={"input-label"}
            key={index}
            htmlFor={shortcut.getField()}
          >
            {validationErrors[shortcut.getField()] && (
              <span
                className={styles["client-validation-error"]}
                aria-label={`${shortcut.getPlaceholder()} validation error`}
                data-testid={"validation-msg"}
              >
                {validationErrors[shortcut.getField()]}
              </span>
            )}
            <input
              value={
                formData[shortcut.getField()]
                  ? formData[shortcut.getField()]
                  : ""
              }
              onChange={handleInputChange}
              {...shortcut.getProps()}
            ></input>
          </label>
        );
      })}
    </>
  );
}

RegisterFormInputs.propTypes = {
  validationErrors: PropTypes.objectOf(
    (propValue, key, componentName, location, propFullName) => {
      if (
        typeof propValue[key] != "string" ||
        !RegistrationValidator.isAllowed(key)
      )
        return new Error(
          `Invalid prop ${propFullName} supplied to ${componentName}, should be instance of errorMessages`
        );
    }
  ).isRequired,
  changeFormData: PropTypes.func.isRequired,
  formData: PropTypes.objectOf(
    (propValue, key, componentName, location, propFullName) => {
      if (!RegistrationValidator.isAllowed(key)) {
        return new Error(
          `Invalid prop ${propFullName} supplied to ${componentName}, ${key} field isn't allowed in registration form.`
        );
      }
    }
  ).isRequired,
};
export default RegisterFormInputs;
