const corsOptions = {
  origin: JSON.parse(process.env.CORS_LIST),
};

export const corsConfig = [corsOptions];
