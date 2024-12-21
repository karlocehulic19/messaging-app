const corsOptions = {
  origin: JSON.parse(process.env.CORS_LIST),
};

module.exports.corsConfig = [corsOptions];
