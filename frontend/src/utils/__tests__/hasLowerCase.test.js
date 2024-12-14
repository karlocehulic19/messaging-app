import { hasLowerCase } from "../hasLowerCase";

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
