import LoginForm from "../LoginForm";
import { describe, it, expect, beforeEach } from "vitest";
import { screen, render, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { config } from "../../Constants";
import { vitest } from "vitest";

describe("<LoginForm />", () => {
  let user;

  beforeEach(() => {
    render(<LoginForm />);
    user = userEvent.setup();

    global.fetch = vitest.fn(() => new Promise(() => undefined));
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

  describe("validation logic", () => {
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

    it("removes missing username on second try if username is not empty", async () => {
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("randomPassword");

      await user.click(screen.getByRole("button"));

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("randomUsername");

      await user.click(screen.getByRole("button"));

      expect(() => screen.getByText("Username can't be empty")).toThrow();
    });

    it("removes missing password on second try if password is not empty", async () => {
      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("randomUsername");

      await user.click(screen.getByRole("button"));

      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("randomPassword");

      await user.click(screen.getByRole("button"));

      expect(() => screen.getByText("Password can't be empty")).toThrow();
    });

    it("removes missing username on second try if username is not empty", async () => {
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("randomPassword");

      await user.click(screen.getByRole("button"));

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("randomUsername");

      await user.click(screen.getByRole("button"));

      expect(() => screen.getByText("Username can't be empty")).toThrow();
    });

    it("removes both missing password and username msg on second try if password and username is not empty", async () => {
      await user.click(screen.getByRole("button"));

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("randomUsername");
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("randomPassword");

      await user.click(screen.getByRole("button"));

      expect(() => screen.getByText("Password can't be empty")).toThrow();
      expect(() => screen.getByText("Username can't be empty")).toThrow();
    });

    it("display's both missing password and username when login btn is clicked", async () => {
      await user.click(screen.getByRole("button"));

      expect(() => screen.getByText("Username can't be empty")).not.toThrow();
      expect(() => screen.getByText("Password can't be empty")).not.toThrow();
    });
  });

  describe("fetching logic", () => {
    it("doesn't call fetch when password is missing", async () => {
      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("randomUsername");
      await user.click(screen.getByRole("button"));

      expect(global.fetch).not.toBeCalled();
    });

    it("doesn't call fetch when username is missing", async () => {
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("randomPassword");
      await user.click(screen.getByRole("button"));

      expect(global.fetch).not.toBeCalled();
    });

    it("doesn't call fetch when both username and password are missing", async () => {
      await user.click(screen.getByRole("button"));

      expect(global.fetch).not.toBeCalled();
    });

    it("calls fetch with username and password input", async () => {
      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("someUsername");
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("somePassword");

      await user.click(screen.getByRole("button"));

      expect(global.fetch).toBeCalledWith(`${config.url.BACKEND_URL}/login`, {
        method: "post",
        body: JSON.stringify({
          username: "someUsername",
          password: "somePassword",
        }),
      });
    });

    it("replaces button for loading button", async () => {
      const fetchPromise = new Promise(() => {});
      // so while loading response and or json fetching via button should not be available(replaced with not working button)

      global.fetch = vitest.fn(() => fetchPromise);
      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("someUsername");
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("somePassword");

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("button").textContent).toBe("Loading...");
    });

    it("removes loading on internet connection error", async () => {
      let fetchReject;
      const fetchPromise = new Promise((resolve, reject) => {
        fetchReject = reject;
      });
      // so while loading response and or json fetching via button should not be available(replaced with not working button)

      global.fetch = vitest.fn(() => fetchPromise);
      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("someUsername");
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("somePassword");

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("button").textContent).toBe("Loading...");
      expect(screen.getByRole("button").disabled).toBe(true);

      await act(async () => {
        fetchReject("Mocked internet error");
      });

      expect(screen.getByRole("button").textContent).toBe("Login");
    });

    it("displays error message after failed fetch", async () => {
      let fetchReject;
      let fetchPromise = new Promise((resolve, reject) => {
        fetchReject = reject;
      });

      global.fetch = vitest.fn(() => fetchPromise);

      expect(() => screen.getByTestId("login-server-error")).toThrow();

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("someUsername");
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("somePassword");

      await user.click(screen.getByRole("button"));

      await act(async () => {
        fetchReject("Mocked internet error");
      });

      expect(screen.getByTestId("login-server-error").textContent).toBe(
        "Error occurred: Please try again!"
      );
    });

    it("displays error message after unaccepted error codes", async () => {
      let fetchResolve;
      let fetchPromise = new Promise((resolve) => {
        fetchResolve = resolve;
      });

      global.fetch = vitest.fn(() => fetchPromise);

      expect(() => screen.getByTestId("login-server-error")).toThrow();

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("someUsername");
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("somePassword");

      await user.click(screen.getByRole("button"));

      await act(async () => {
        fetchResolve({
          status: 422,
          statusText: "Unprocessable Content",
          url: "http://exampleurl.com",
        });
      });

      expect(screen.getByTestId("login-server-error").textContent).toBe(
        "Error occurred: Please try again!"
      );
    });

    it("calls callback when got 200 status", async () => {
      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("someUsername");
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("somePassword");

      await user.click(screen.getByRole("button"));
    });
  });
});
