import { describe, expect, vi } from "vitest";
import customFetch from "../customFetch";

function getLocalStorageSpy() {
  const localStorageSpy = vi
    .spyOn(Storage.prototype, "getItem")
    .mockImplementation(() => "someToken");
  return { localStorageSpy };
}

describe("customFetch()", () => {
  it("fetches without token", async () => {
    const { localStorageSpy } = getLocalStorageSpy();
    localStorageSpy.mockImplementationOnce(() => null);
    const response = await customFetch("/test");
    const data = await response.json();

    expect(data.isValid).toBe(true);
  });

  it("fetches application/json by default", async () => {
    const { localStorageSpy } = getLocalStorageSpy();
    localStorageSpy.mockImplementationOnce(() => null);
    const response = await customFetch("/test");
    const data = await response.json();

    expect(data.passedHeaders).toContainEqual([
      "content-type",
      "application/json",
    ]);
  });

  it("fetches with a token", async () => {
    getLocalStorageSpy();
    const response = await customFetch("/test");
    const data = await response.json();

    expect(data.passedHeaders).toContainEqual([
      "authorization",
      "Bearer someToken",
    ]);
  });

  it("fetches with token and custom header options (explicit)", async () => {
    getLocalStorageSpy();
    const response = await customFetch("/test", {
      headers: { "Content-Type": "text/plain" },
    });
    const data = await response.json();

    expect(data.passedHeaders).toEqual([
      ["authorization", "Bearer someToken"],
      ["content-type", "text/plain"],
    ]);
  });
});
