import { hasGlobalAlpha } from "../../../common/utils/customIsAlpha";
import { ValidatorBuilder } from "./CustomValidator";
import {
  isRequired,
  hasLowerCase,
  hasUpperCase,
  hasNumeric,
} from "./validationExpressions";
import validator from "validator";

const RegistrationValidatorBuilder = new ValidatorBuilder();

RegistrationValidatorBuilder.field("username")
  .addRule(isRequired, "Username field is required")
  .addRule(validator.isAscii, "Invalid characters are provided");

RegistrationValidatorBuilder.field("firstName")
  .addRule(isRequired, "First name is required")
  .addRule(hasGlobalAlpha, "First name must contain only letters");

RegistrationValidatorBuilder.field("lastName")
  .addRule(isRequired, "Last name is required")
  .addRule(hasGlobalAlpha, "Last name must contain only letters");

RegistrationValidatorBuilder.field("email")
  .addRule(isRequired, "Email field is required")
  .addRule(validator.isEmail, "Value provided must be an valid email address");

RegistrationValidatorBuilder.field("password")
  .addRule(isRequired, "Password field is required")
  .addRule(
    (value) => validator.isLength(value, { min: 8 }),
    "Password must contain at least 8 characters"
  )
  .addRule(hasUpperCase, "Password must contain at least one uppercase letter")
  .addRule(hasLowerCase, "Password must contain at least one lowercase letter")
  .addRule(hasNumeric, "Password must contain at least one number")
  .addRule(
    (value) => validator.matches(value, /[-!$%@^&*()_+|~=`{}\[\]:";'<>?,.\/]/),
    "Password must contain at least one symbol"
  );

RegistrationValidatorBuilder.field("passwordConf")
  .addRule(isRequired, "Password confirmation is required")
  .addRule((value, { formData }) => {
    return value === formData.password;
  }, "Password confirmation must be same as password");

export default RegistrationValidatorBuilder.build();
