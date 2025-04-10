const prod = {
  url: {
    BACKEND_URL: import.meta.env.VITE_PROD_BACKEND_URL,
  },
};

const dev = {
  url: {
    BACKEND_URL: import.meta.env.VITE_DEV_BACKEND_URL,
  },
};

export const POOLING_INTERVAL_TIME_SECONDS = 3;

export const config = import.meta.env.MODE === "production" ? prod : dev;
