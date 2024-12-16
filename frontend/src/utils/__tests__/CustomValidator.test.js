import { afterEach, describe, expect, it, vi } from "vitest";
import { CustomValidator, ValidatorBuilder } from "../CustomValidator";

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

    it("callback are called with optional argument", async () => {
      const { validator, mockedValidations, testData } = setup();

      mockedValidations.email.mockImplementation(
        (value, { formData }) => formData === testData
      );

      expect(await validator.validate(testData)).toEqual({});
    });
  });
});

const setupBuilder = () => {
  const builder = new ValidatorBuilder();

  return { builder };
};

describe("ValidatorBuilder", () => {
  describe("field()", () => {
    it("throws on empty field", () => {
      const { builder } = setupBuilder();

      expect(() => builder.field()).toThrow(
        "Field argument must be a non empty string"
      );
    });

    it("throws on falsy values", () => {
      const { builder } = setupBuilder();

      expect(() => builder.field(null)).toThrow(
        "Field argument must be a non empty string"
      );
      expect(() => builder.field(undefined)).toThrow(
        "Field argument must be a non empty string"
      );
      expect(() => builder.field(0)).toThrow(
        "Field argument must be a non empty string"
      );
    });

    it("throws on non strings", () => {
      const { builder } = setupBuilder();

      expect(() => builder.field(10)).toThrow(
        "Field argument must be a non empty string"
      );

      expect(() => builder.field({ foo: "bar" })).toThrow(
        "Field argument must be a non empty string"
      );
    });

    it("returns builder obj", () => {
      const { builder } = setupBuilder();
      expect(builder.field("some")).toBe(builder);
    });
  });

  describe("build() and addRule()", () => {
    it("addRule throws on unspecified field", () => {
      const { builder } = setupBuilder();

      expect(() => {
        builder.addRule(() => true, "Some error");
      }).toThrow("Field name must be specified before adding a rule");
    });

    it("builder returns custom validation obj", () => {
      const { builder } = setupBuilder();
      expect(builder.build()).toBeInstanceOf(CustomValidator);
    });

    it("addRule adds validationRule to validator", () => {
      const { builder } = setupBuilder();
      builder.field("test").addRule("");

      expect(builder.build()).toBeInstanceOf(CustomValidator);
    });

    it("addRule works with different fields", async () => {
      const { builder } = setupBuilder();
      const usernameRule = vi.fn(() => true);
      const passwordRule = vi.fn(() => true);

      builder.field("username").addRule(usernameRule, "username rule error");
      builder.field("password").addRule(passwordRule, "password rule error");

      const validator = builder.build();

      expect(await validator.validate({})).toEqual({});

      usernameRule.mockReturnValueOnce(false);

      expect(await validator.validate({})).toEqual({
        username: "username rule error",
      });

      passwordRule.mockReturnValueOnce(false);

      expect(await validator.validate({})).toEqual({
        password: "password rule error",
      });
    });

    it("addRule works with multiple field rules", async () => {
      const { builder } = setupBuilder();
      const firstUsernameRule = vi.fn(() => true);
      const secondUsernameRule = vi.fn(() => true);

      builder
        .field("username")
        .addRule(firstUsernameRule, "username1 rule error")
        .addRule(secondUsernameRule, "username2 rule error");

      const validator = builder.build();

      expect(await validator.validate({})).toEqual({});

      firstUsernameRule.mockReturnValueOnce(false);

      expect(await validator.validate({})).toEqual({
        username: "username1 rule error",
      });

      secondUsernameRule.mockReturnValueOnce(false);

      expect(await validator.validate({})).toEqual({
        username: "username2 rule error",
      });
    });
  });
});
