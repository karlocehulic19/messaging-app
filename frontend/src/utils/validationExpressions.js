import { isUppercase, isLowercase, isNumeric } from "validator";
import { hasGlobalAlphaCB } from "../../../common/utils/customIsAlpha";

// async version
export const hasUpperCase = async (value) =>
  await hasGlobalAlphaCB(value, isUppercase);

export const hasLowerCase = async (value) =>
  await hasGlobalAlphaCB(value, isLowercase);

export function isRequired(value) {
  return value == "" ? false : !!value;
}

export function hasNumeric(str) {
  for (const s of str) {
    if (isNumeric(s)) return true;
  }

  return false;
}
