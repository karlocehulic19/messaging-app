import { describe, expect } from "vitest";
import {
  isRequired,
  hasUpperCase,
  hasLowerCase,
  hasNumeric,
} from "../validationExpressions";

describe("hasUpperCase()", () => {
  it("returns true if uppercase char is provided", async () => {
    expect(await hasUpperCase("Karlo")).toBe(true);
    expect(await hasUpperCase("Karlo1")).toBe(true);
  });

  it("returns false if uppercase char isn't provided", async () => {
    expect(await hasUpperCase("karlo")).toBe(false);
    expect(await hasUpperCase("123")).toBe(false);
  });

  it("returns true if any uppercase char is provided(any of all local uppercase)", async () => {
    expect(await hasUpperCase("Čoki")).toBe(true);
  });
});

describe("isRequired()", () => {
  it("returns false on empty string", () => {
    expect(isRequired("")).toBe(false);
  });

  it("returns true on falsy string values", () => {
    expect(isRequired("0")).toBe(true);
    expect(isRequired("null")).toBe(true);
    expect(isRequired("undefined")).toBe(true);
    expect(isRequired("false")).toBe(true);
  });

  it("returns false on actual falsy values", () => {
    expect(isRequired(0)).toBe(false);
    expect(isRequired(null)).toBe(false);
    expect(isRequired(undefined)).toBe(false);
    expect(isRequired(false)).toBe(false);
  });
});

describe("hasLowerCase()", () => {
  it("returns true if lowercase char is provided", async () => {
    expect(await hasLowerCase("KARLo")).toBe(true);
    expect(await hasLowerCase("KARLo1")).toBe(true);
  });

  it("returns false if lowercase char isn't provided", async () => {
    expect(await hasLowerCase("KARLO")).toBe(false);
    expect(await hasLowerCase("123")).toBe(false);
  });

  it("returns true if any lowercase char is provided(any of all local uppercase)", async () => {
    expect(await hasLowerCase("čOKI")).toBe(true);
  });
});

describe("hasNumeric()", () => {
  it("returns true if number is present in str", () => {
    expect(hasNumeric("karlo1")).toBe(true);
  });

  it("returns false if number isn'y present in str", () => {
    expect(hasNumeric("two")).toBe(false);
  });
});
