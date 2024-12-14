import { afterEach, describe, expect, it, vi } from "vitest";
import CustomValidator from "../CustomValidator";

const setup = () => {
  const mockedValidations = {
    email: vi.fn(() => true),
    username1: vi.fn(() => true),
    username2: vi.fn(() => true),
    username3: vi.fn(() => true),
    password: vi.fn(() => true),
  };

  const testData = {
    email: "test@email.com",
    username: "someUsername",
    password: "smth",
  };

  const validator = new CustomValidator();

  validator.addValidation(
    "email",
    mockedValidations.email,
    "email validation fails"
  );
  validator.addValidation(
    "username",
    mockedValidations.username1,
    "username1 validation fails"
  );
  validator.addValidation(
    "username",
    mockedValidations.username2,
    "username2 validation fails"
  );
  validator.addValidation(
    "username",
    mockedValidations.username3,
    "username3 validation fails"
  );
  validator.addValidation(
    "password",
    mockedValidations.password,
    "password validation fails"
  );

  return { mockedValidations, validator, testData };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CustomValidator", () => {
  describe("isAllowed()", () => {
    it("return true on valid fields", () => {
      const { validator } = setup();

      expect(validator.isAllowed("email")).toBe(true);
      expect(validator.isAllowed("password")).toBe(true);
      expect(validator.isAllowed("username")).toBe(true);
    });

    it("return false on invalid fields", () => {
      const { validator } = setup();

      expect(validator.isAllowed("Foo1")).toBe(false);
      expect(validator.isAllowed("Bar2")).toBe(false);
      expect(validator.isAllowed("Random3")).toBe(false);
      expect(validator.isAllowed("Test4")).toBe(false);
    });
  });

  describe("validate()", () => {
    it("returns '{}' on successful validation (happy path)", async () => {
      const { validator, testData } = setup();

      expect(await validator.validate(testData)).toEqual({});
    });

    it("returns obj with one field error and message", async () => {
      const { validator, mockedValidations, testData } = setup();
      mockedValidations.email.mockImplementation(() => false);

      expect(await validator.validate(testData)).toEqual({
        email: "email validation fails",
      });

      mockedValidations.email.mockRestore();
      mockedValidations.password.mockImplementation(() => false);

      expect(await validator.validate(testData)).toEqual({
        password: "password validation fails",
      });
    });

    it("returns errors from first validation that fails", async () => {
      const { validator, mockedValidations, testData } = setup();

      mockedValidations.username2.mockReturnValueOnce(false);

      expect(await validator.validate(testData)).toEqual({
        username: "username2 validation fails",
      });

      mockedValidations.username3.mockReturnValueOnce(false);
      expect(await validator.validate(testData)).toEqual({
        username: "username3 validation fails",
      });
    });

    it("returns multiple obj with fields errors and messages", async () => {
      const { validator, mockedValidations, testData } = setup();

      mockedValidations.email.mockImplementation(() => false);
      mockedValidations.password.mockImplementation(() => false);

      expect(await validator.validate(testData)).toEqual({
        email: "email validation fails",
        password: "password validation fails",
      });

      mockedValidations.username2.mockImplementation(() => false);
      expect(await validator.validate(testData)).toEqual({
        email: "email validation fails",
        password: "password validation fails",
        username: "username2 validation fails",
      });
    });

    it("works with async validation callbacks", async () => {
      const { validator, mockedValidations, testData } = setup();

      mockedValidations.email.mockImplementation(() => Promise.resolve(true));

      expect(await validator.validate(testData)).toEqual({});

      mockedValidations.email.mockImplementation(() => Promise.resolve(false));

      expect(await validator.validate(testData)).toEqual({
        email: "email validation fails",
      });
    });
  });
});
