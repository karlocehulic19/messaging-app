import { ValidatorBuilder } from "./CustomValidator";
import { emailRules, usernameRules } from "./baseValidationRules";

const UpdateValidatorBuilder = new ValidatorBuilder();

usernameRules(UpdateValidatorBuilder);
emailRules(UpdateValidatorBuilder);

export default UpdateValidatorBuilder.build();
