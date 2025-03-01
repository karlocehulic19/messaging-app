import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom";
import { server } from "../mocks/node";
import "blob-polyfill";

expect.extend(matchers);
vi.spyOn(console, "log").mockImplementation(() => undefined);
vi.spyOn(console, "error").mockImplementation(() => undefined);

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  cleanup();
});

afterAll(() => {
  server.close();
});
