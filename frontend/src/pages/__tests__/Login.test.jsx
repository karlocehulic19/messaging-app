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
  it("renders correctly", () => {
    expect(() => screen.getByLabelText("Login form")).not.toThrow();
  });

  it("renders inputs and labels", () => {
    expect(() => screen.getByText("Username:")).not.toThrow();
    expect(() => screen.getByText("Password:")).not.toThrow();
    expect(screen.getByLabelText("Password input").id).toBe("password");
    expect(screen.getByLabelText("Username input").id).toBe("username");
    expect(screen.getByLabelText("Password input").getAttribute("type")).toBe(
      "password"
    );
  });

  it("renders submit button", () => {
    const btn = screen.getByRole("button");

    expect(btn.getAttribute("type")).toBe("submit");
    expect(btn.parentNode).toBe(screen.getByLabelText("Login form"));
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

  it("redirects when clicked on register escape", async () => {
    const regA = screen.getByRole("link");

    expect(regA.textContent).toBe("HERE");
    await user.click(regA);

    expect(mockedNavigate).toBeCalledWith("/register");
  });

  it("displays required message on missing username when login is clicked", async () => {
    await user.click(screen.getByLabelText("Password input"));
    await user.keyboard("randomPassword");
    await user.click(screen.getByRole("button"));

    expect(() => screen.getByText("Username can't be empty")).not.toThrow();
  });

  it("doesn't display required message on missing username when login isn't clicked", async () => {
    await user.click(screen.getByLabelText("Password input"));
    await user.keyboard("randomPassword");

    expect(() => screen.getByText("Username can't be empty")).toThrow();
  });

  it("displays required message on missing password when login is clicked", async () => {
    await user.click(screen.getByLabelText("Username input"));
    await user.keyboard("randomUsername");
    await user.click(screen.getByRole("button"));

    expect(() => screen.getByText("Password can't be empty")).not.toThrow();
  });

  it("doesn't display required message on missing password when login isn't clicked", async () => {
    await user.click(screen.getByLabelText("Username input"));
    await user.keyboard("randomUsername");

    expect(() => screen.getByText("Password can't be empty")).toThrow();
  });

  it("display's both missing password and username when login btn is clicked", async () => {
    await user.click(screen.getByRole("button"));

    expect(() => screen.getByText("Username can't be empty")).not.toThrow();
    expect(() => screen.getByText("Password can't be empty")).not.toThrow();
  });

  it("doesn't call fetch when password is missing", async () => {
    global.fetch = vitest.fn();

    await user.click(screen.getByLabelText("Username input"));
    await user.keyboard("randomUsername");
    await user.click(screen.getByRole("button"));

    expect(global.fetch).not.toBeCalled();
  });

  it("doesn't call fetch when username is missing", async () => {
    global.fetch = vitest.fn();

    await user.click(screen.getByLabelText("Password input"));
    await user.keyboard("randomPassword");
    await user.click(screen.getByRole("button"));

    expect(global.fetch).not.toBeCalled();
  });

  it("doesn't call fetch when both username and password are missing", async () => {
    global.fetch = vitest.fn();

    await user.click(screen.getByRole("button"));

    expect(global.fetch).not.toBeCalled();
  });
});
