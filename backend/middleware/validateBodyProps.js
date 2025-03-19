module.exports = (formDataProps) => (req, res, next) => {
  const missing = [];
  const surplus = [];

  for (const prop of formDataProps) {
    if (!Object.keys(req.body).includes(prop)) missing.push(prop);
  }

  if (missing.length) {
    return res
      .status(400)
      .send({ error: `Missing body property/ies: ${missing.join(", ")}` });
  }

  for (const bProp of Object.keys(req.body)) {
    if (![...formDataProps, "pictureBase64"].includes(bProp))
      surplus.push(bProp);
  }

  if (surplus.length) {
    return res.status(400).send({
      error: `Request sent invalid properties: ${surplus.join(", ")}`,
    });
  }

  next();
};
