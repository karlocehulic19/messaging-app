const express = require("express");
const app = express();
const prisma = require("../prisma");
const request = require("supertest");

app.use(express.json());

module.exports = { app, prisma, request };
