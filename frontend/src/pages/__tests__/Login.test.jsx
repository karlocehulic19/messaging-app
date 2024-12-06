import { screen, render } from "@testing-library/react";
import Login from "../Login";
import { beforeEach, describe, expect, vitest } from "vitest";
import userEvent from "@testing-library/user-event";

const mockedNavigate = vitest.fn();

vitest.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockedNavigate,
}));

describe("<Login />", () => {
  let user;

  beforeEach(() => {
    render(<Login />);

    user = userEvent.setup();
  });
  describe("rendering", () => {
    it("renders login form", () => {
      expect(() => screen.getByLabelText("Login form")).not.toThrow();
    });
    it("renders title", () => {
      expect(screen.getByRole("heading").textContent).toBe("Login");
    });

    it("renders escape to register route", () => {
      expect(() =>
        screen.getByText("You don't have an account? Register here:")
      ).not.toThrow();
      expect(() => screen.getByRole("link")).not.toThrow();
    });
  });

  describe("redirects", () => {
    it("redirects when clicked on register escape", async () => {
      const regA = screen.getByRole("link");

      expect(regA.textContent).toBe("HERE");
      await user.click(regA);

      expect(mockedNavigate).toBeCalledWith("/register");
    });
  });
});
