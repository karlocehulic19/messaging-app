module.exports = (necessaryQueryParams) => (req, res, next) => {
  const missing = [];
  for (const q of necessaryQueryParams) {
    if (!(q in req.query)) missing.push(q);
  }

  if (missing.length > 0) {
    return res.status(400).send({
      error: `Missing query parameters: ${missing.join(", ")}`,
    });
  }

  next();
};
