import { isRequired } from "../isRequired";

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
