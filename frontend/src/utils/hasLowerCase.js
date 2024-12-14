import { isLowercase } from "validator";
import { isGlobalAlphaCB } from "../../../common/utils/customIsAlpha";

// async version
export const hasLowerCase = async (str) =>
  await isGlobalAlphaCB(str, isLowercase);
