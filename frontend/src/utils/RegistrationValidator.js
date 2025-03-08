import { hasGlobalAlpha } from "../../../common/utils/customIsAlpha";
import { emailRules, usernameRules } from "./baseValidationRules";
import { ValidatorBuilder } from "./CustomValidator";
import {
  isRequired,
  hasLowerCase,
  hasUpperCase,
  hasNumeric,
} from "./validationExpressions";
import validator from "validator";

const RegistrationValidatorBuilder = new ValidatorBuilder();

usernameRules(RegistrationValidatorBuilder);
emailRules(RegistrationValidatorBuilder);

RegistrationValidatorBuilder.field("firstName")
  .addRule(isRequired, "First name is required")
  .addRule(hasGlobalAlpha, "First name must contain only letters");

RegistrationValidatorBuilder.field("lastName")
  .addRule(isRequired, "Last name is required")
  .addRule(hasGlobalAlpha, "Last name must contain only letters");

RegistrationValidatorBuilder.field("password")
  .addRule(isRequired, "Password field is required")
  .addRule(hasUpperCase, "Password must contain at least one uppercase letter")
  .addRule(hasLowerCase, "Password must contain at least one lowercase letter")
  .addRule(hasNumeric, "Password must contain at least one number")
  .addRule(
    // eslint-disable-next-line no-useless-escape
    (value) => validator.matches(value, /[-!$%@^&*()_+|~=`{}\[\]:";'<>?,.\/]/),
    "Password must contain at least one symbol"
  )
  .addRule(
    (value) => validator.isLength(value, { min: 8 }),
    "Password must contain at least 8 characters"
  );

RegistrationValidatorBuilder.field("passwordConf")
  .addRule(isRequired, "Password confirmation is required")
  .addRule((value, { formData }) => {
    return value === formData.password;
  }, "Password confirmation must be same as password");

export default RegistrationValidatorBuilder.build();
