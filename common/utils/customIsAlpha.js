// tested in authRouter integration tests in backend workspace
const validator = require("validator");

const isGlobalAlpha = async (str) => {
  const promises = [];

  for (const locale of validator.isAlphaLocales) {
    promises.push(
      new Promise((resolve, reject) => {
        validator.isAlpha(str, locale) ? resolve() : reject();
      })
    );
  }

  return await Promise.any(promises)
    .then(() => true)
    .catch(() => false);
};

module.exports.isGlobalAlpha = isGlobalAlpha;

module.exports.customIsAlpha = (prettyPath) => {
  return async (val) => {
    if (!(await isGlobalAlpha(val))) {
      throw new Error(`${prettyPath} contains non alphabetical values`);
    }
  };
};

// tested in frontend hasUpperCase and hasLowerCase
module.exports.isGlobalAlphaCB = async (str, callback) => {
  const promises = [];

  for (const n of str) {
    promises.push(
      new Promise((resolve, reject) => {
        isGlobalAlpha(n).then((res) => {
          if (res && callback(n)) resolve();
          reject();
        });
      })
    );
  }

  return await Promise.any(promises)
    .then(() => true)
    .catch(() => false);
};
