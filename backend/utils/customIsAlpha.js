const validator = require("validator");

module.exports = async (val, { path }) => {
  const promises = [];

  for (const locale of validator.isAlphaLocales) {
    promises.push(
      new Promise((resolve, reject) => {
        validator.isAlpha(val, locale) ? resolve() : reject();
      })
    );
  }

  await Promise.any(promises).catch(() => {
    throw new Error(`${path} contains non alphabetical values`);
  });
};
