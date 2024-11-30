/* eslint-disable no-unused-vars */
module.exports = (err, req, res, next) => {
  console.log(err);

  res.send(err.statusCode || 500).send(err.message || "Internal Server Error");
};
