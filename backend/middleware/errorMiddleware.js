// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  if (!err.statusCode) console.log(err);

  res
    .status(err.statusCode || 500)
    .send({ error: err.statusCode ? err.message : "Internal Server Error" });
};
