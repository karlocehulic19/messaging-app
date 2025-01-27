const express = require("express");
const prisma = require("../prisma");
const request = require("supertest");

module.exports = () => {
  const app = express();
  app.use(express.json());

  return {
    app,
    prisma,
    request,
  };
};
