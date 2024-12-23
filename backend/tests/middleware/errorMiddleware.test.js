const express = require("express");
const request = require("supertest");
const asyncHandler = require("express-async-handler");
const errorMiddleware = require("../../middleware/errorMiddleware");

class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const setup = () => {
  const app = express();
  app.use(express.json());

  app.get("/error/sync", () => {
    // Mocking actual dev error
    // eslint-disable-next-line no-undef, no-unused-vars
    const willTrow = notDefined;
  });

  app.get(
    "/error/async",
    asyncHandler(async () => {
      // Mocking actual dev error
      // eslint-disable-next-line no-undef, no-unused-vars
      const willTrow = notDefined;
    })
  );

  app.get("/error/custom/sync", () => {
    throw new CustomError("Custom error message", 400);
  });

  app.get(
    "/error/custom/async",
    asyncHandler(async () => {
      throw new CustomError("Custom error message", 400);
    })
  );

  app.use(errorMiddleware);

  // eslint-disable-next-line no-undef
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

  return { logSpy, app };
};

test("Responding with 500 and internal server error on sync throw", () => {
  const { app } = setup();

  return request(app)
    .get("/error/sync")
    .expect(500)
    .expect({ error: "Internal Server Error" });
});

test("Responding with 500 and internal server error on async throw", () => {
  const { app } = setup();

  return request(app)
    .get("/error/sync")
    .expect(500)
    .expect({ error: "Internal Server Error" });
});

test("Responding with custom status code and custom message on custom sync throw", () => {
  const { app } = setup();

  return request(app)
    .get("/error/custom/sync")
    .expect(400)
    .expect({ error: "Custom error message" });
});

test("Responding with custom status code and custom message on custom async throw", () => {
  const { app } = setup();

  return request(app)
    .get("/error/custom/async")
    .expect(400)
    .expect({ error: "Custom error message" });
});

test("Logging on sync 500", async () => {
  const { app, logSpy } = setup();
  await request(app).get("/error/sync");

  expect(logSpy).toBeCalledTimes(1);
});

test("Logging on async 500", async () => {
  const { app, logSpy } = setup();
  await request(app).get("/error/async");

  expect(logSpy).toBeCalledTimes(1);
});

test("Not logging on custom sync", async () => {
  const { app, logSpy } = setup();
  await request(app).get("/error/custom/sync");

  expect(logSpy).toBeCalledTimes(0);
});

test("Not logging on custom async", async () => {
  const { app, logSpy } = setup();
  await request(app).get("/error/custom/async");

  expect(logSpy).toBeCalledTimes(0);
});
