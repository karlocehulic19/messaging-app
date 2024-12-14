import { isUppercase } from "validator";
import { isGlobalAlphaCB } from "../../../common/utils/customIsAlpha";

// async version
export const hasUpperCase = async (str) =>
  await isGlobalAlphaCB(str, isUppercase);
