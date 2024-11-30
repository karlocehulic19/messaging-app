module.exports = (
  containCondition,
  containCallback,
  filter = () => new Promise((resolve) => resolve(true))
) => {
  return async (value) => {
    const promises = [];

    for (const s of value) {
      promises.push(
        new Promise((resolve, reject) => {
          filter(s).then((result) => {
            result ? (containCallback(s) ? resolve() : reject()) : reject();
          });
        })
      );
    }

    await Promise.any(promises).catch(() => {
      throw new Error(`Password must contain at least one ${containCondition}`);
    });
  };
};
