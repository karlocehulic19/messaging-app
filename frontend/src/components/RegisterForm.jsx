import { useNavigate } from "react-router-dom";
import RegistrationValidator from "../utils/RegistrationValidator";
import useValidator from "../hooks/useValidator";
import { useDropzone } from "react-dropzone";
import styles from "./styles/RegisterForm.module.css";

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
  const { formData, changeFormData, validationErrors, syncValidate } =
    useValidator(RegistrationValidator);
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      maxFiles: 1,
      accept: {
        "image/jpeg": [],
        "image/png": [],
      },
    });

  const fileRejected = !!fileRejections.length;

  async function handleSubmit(e) {
    e.preventDefault();
    if (await syncValidate(formData)) navigate("/login");
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
      <div>
        {fileRejected && (
          <p>Please select image that is in PNG or JPEG format</p>
        )}
        <div
          {...getRootProps({
            className: "dropbox",
            id: styles["picture-dropbox"],
            ["aria-label"]: "Profile picture dropbox",
          })}
        >
          <input
            {...getInputProps({
              htmlFor: "profile-picture",
              id: "profile-picture",
              ["data-testid"]: "picture-input",
            })}
          />
          <p>Drop your profile picture here!</p>
        </div>
      </div>
      <button type="submit">Register</button>
    </form>
  );
}

export default RegisterForm;
