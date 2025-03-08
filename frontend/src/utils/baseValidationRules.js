import { isAscii } from "validator";
import { isRequired } from "./validationExpressions";
import isEmail from "validator/lib/isEmail";

export const usernameRules = (ValidationBuilder, field = "username") => {
  ValidationBuilder.field(field)
    .addRule(isRequired, "Username field is required")
    .addRule(isAscii, "Invalid characters are provided");
};

export const emailRules = (ValidationBuilder, field = "email") => {
  ValidationBuilder.field(field)
    .addRule(isRequired, "Email field is required")
    .addRule(isEmail, "Value provided must be valid email address");
};
