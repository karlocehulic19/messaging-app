import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom";
import { server } from "../mocks/node";
import "blob-polyfill";

expect.extend(matchers);

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  vi.restoreAllMocks();
  server.resetHandlers();
  localStorage.clear();
  cleanup();
});

afterAll(() => {
  server.close();
});
