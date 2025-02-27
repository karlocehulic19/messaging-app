const express = require("express");
const prisma = require("../prisma");
const request = require("supertest");
const errorMiddleware = require("../middleware/errorMiddleware");

module.exports = function (configureApp) {
  const app = express();
  app.use(express.json());

  configureApp(app);

  app.use(errorMiddleware);

  return {
    app,
    prisma,
    request,
  };
};
