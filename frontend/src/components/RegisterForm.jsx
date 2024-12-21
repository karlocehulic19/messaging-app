import { useNavigate } from "react-router-dom";
import RegistrationValidator from "../utils/RegistrationValidator";
import useValidator from "../hooks/useValidator";

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

function RegisterForm() {
  const navigate = useNavigate();
  const { formData, changeFormData, validationErrors } = useValidator(
    RegistrationValidator
  );

  function handleSubmit(e) {
    e.preventDefault();
    const hasErrors = !!Object.keys(validationErrors).length;
    if (!hasErrors) navigate("/login");
  }

  function handleInputChange(e) {
    changeFormData(e.target.id, e.target.value);
  }

  return (
    <form noValidate onSubmit={handleSubmit} aria-label="Login form">
      {defaultInputs.map((shortcut, index) => {
        return (
          <label
            data-testid={"input-label"}
            key={index}
            htmlFor={shortcut.getField()}
          >
            {validationErrors[shortcut.getField()] && (
              <span
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
      <button type="submit">Register</button>
    </form>
  );
}

export default RegisterForm;
