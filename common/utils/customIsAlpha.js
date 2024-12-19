// tested in authRouter integration tests in backend workspace
import validator from "validator";

function createAlphaPromises(str) {
  const promises = [];

  for (const locale of validator.isAlphaLocales) {
    promises.push(
      new Promise((resolve, reject) => {
        validator.isAlpha(str, locale) ? resolve() : reject();
      })
    );
  }

  return promises;
}

export const hasGlobalAlpha = async (str) => {
  return await Promise.any(createAlphaPromises(str))
    .then(() => true)
    .catch(() => false);
};

export const isGlobalAlpha = async (str) => {
  return await Promise.all(createAlphaPromises(str))
    .then(() => true)
    .catch(() => false);
};

export const customIsAlpha = (prettyPath) => {
  return async (val) => {
    if (!(await hasGlobalAlpha(val))) {
      throw new Error(`${prettyPath} contains non alphabetical values`);
    }
  };
};

// tested in frontend hasUpperCase and hasLowerCase (validationExpressions.test.js)
export const hasGlobalAlphaCB = async (str, callback) => {
  const promises = [];

  for (const n of str) {
    promises.push(
      new Promise((resolve, reject) => {
        hasGlobalAlpha(n).then((res) => {
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
