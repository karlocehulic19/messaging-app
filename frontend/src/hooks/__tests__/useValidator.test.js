import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useValidator from "../useValidator";

function setup() {
  const hookFormData = {
    username: "Test",
    firstName: "Bob",
    lastName: "Smith",
    email: "bobsmth@example.com",
  };

  const mockedValidator = {
    isAllowed: vi.fn(() => true),
    validate: vi.fn(() => {}),
  };

  const { result } = renderHook(() => useValidator(mockedValidator));

  act(() => {
    Object.entries(hookFormData).forEach(([field, value]) =>
      result.current.changeFormData(field, value)
    );
  });

  mockedValidator.isAllowed.mockClear();
  mockedValidator.validate.mockClear();

  return { mockedValidator, hookResult: result, hookFormData };
}

describe("useValidator()", () => {
  it("returns right types", () => {
    const { mockedValidator } = setup();

    const { result } = renderHook(() => useValidator(mockedValidator));
    expect(result.current.formData).toBeTypeOf("object");
    expect(result.current.validationErrors).toBeTypeOf("object");
    expect(result.current.changeFormData).toBeTypeOf("function");
    expect(result.current.validateFormData).toBeTypeOf("function");
  });

  describe("changeFormData()", () => {
    it("changes form data", () => {
      const { mockedValidator } = setup();
      const { result } = renderHook(() => useValidator(mockedValidator));

      expect(result.current.formData).toEqual({});

      act(() => {
        result.current.changeFormData("username", "Karlo");
      });

      expect(result.current.formData).toEqual({ username: "Karlo" });

      act(() => {
        result.current.changeFormData("username", "Luke");
      });

      expect(result.current.formData).toEqual({ username: "Luke" });

      act(() => {
        result.current.changeFormData("id", 1234);
      });

      expect(result.current.formData).toEqual({ username: "Luke", id: 1234 });
    });

    it("doesn't change form data on invalid field", () => {
      const { mockedValidator } = setup();
      const { result } = renderHook(() => useValidator(mockedValidator));

      expect(result.current.formData).toEqual({});

      act(() => {
        result.current.changeFormData("username", "Karlo");
      });

      expect(result.current.formData).toEqual({ username: "Karlo" });

      mockedValidator.isAllowed = vi.fn(() => false);

      act(() => {
        result.current.changeFormData("age", 18);
      });

      expect(result.current.formData).toEqual({ username: "Karlo" });
    });

    it("calls 'validator.isAllowed' with right field", () => {
      const { mockedValidator } = setup();
      const { result } = renderHook(() => useValidator(mockedValidator));

      expect(result.current.formData).toEqual({});

      act(() => {
        result.current.changeFormData("username", "Karlo");
      });
      expect(mockedValidator.isAllowed).toBeCalledTimes(1);
      expect(mockedValidator.isAllowed).toBeCalledWith("username");

      act(() => {
        result.current.changeFormData("age", 18);
      });

      expect(mockedValidator.isAllowed).toBeCalledTimes(2);
      expect(mockedValidator.isAllowed).toBeCalledWith("age");
    });
  });

  describe("validateFormData()", () => {
    it("calls form data with right form data", () => {
      const { mockedValidator, hookResult, hookFormData } = setup();

      act(() => {
        hookResult.current.validateFormData();
      });

      expect(mockedValidator.validate).toBeCalledTimes(1);
      expect(mockedValidator.validate).toBeCalledWith(hookFormData);
    });

    it("sets error messages to 'validator.validate' return value", () => {
      const returnedObj = {};
      const { mockedValidator } = setup();
      mockedValidator.validate = vi.fn(() => returnedObj);
      const { result } = renderHook(() => useValidator(mockedValidator));

      act(() => {
        result.current.validateFormData();
      });

      expect(result.current.validationErrors).toBe(returnedObj);
    });
  });
});
