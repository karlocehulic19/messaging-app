import { hasUpperCase } from "../hasUpperCase";

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
