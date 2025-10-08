const configMapping = {};

configMapping["production"] = {
  url: {
    BACKEND_URL: import.meta.env.VITE_PROD_BACKEND_URL,
  },
  users: {
    demo: {
      DEMO_USER_USERNAME: import.meta.env.VITE_DEMO_USER_USERNAME,
      DEMO_USER_PASSWORD: import.meta.env.VITE_DEMO_USER_PASSWORD,
    },
  },
};

configMapping["development"] = {
  url: {
    BACKEND_URL: import.meta.env.VITE_DEV_BACKEND_URL,
  },
  users: {
    demo: {
      DEMO_USER_USERNAME: import.meta.env.VITE_DEMO_USER_USERNAME,
      DEMO_USER_PASSWORD: import.meta.env.VITE_DEMO_USER_PASSWORD,
    },
  },
};

configMapping["test"] = {
  url: {
    BACKEND_URL: "https://my-cool-app",
  },
  users: {
    demo: {
      DEMO_USER_USERNAME: "demoUser",
      DEMO_USER_PASSWORD: "Password@1",
    },
  },
};

export const POOLING_INTERVAL_TIME_SECONDS = 3;

export const config = configMapping[import.meta.env.MODE];
