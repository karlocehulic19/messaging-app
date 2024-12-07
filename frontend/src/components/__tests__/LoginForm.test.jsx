import LoginForm from "../LoginForm";
import { describe, it, expect, beforeEach, afterAll, afterEach } from "vitest";
import { screen, render, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { config } from "../../Constants";
import { vitest } from "vitest";
import { server } from "../../mocks/node";
import { http, HttpResponse } from "msw";

const loginHandler = (resolver) =>
  http.post(`${config.url.BACKEND_URL}/login`, resolver);

describe("<LoginForm />", () => {
  it("renders correctly", () => {
    render(<LoginForm />);

    expect(() => screen.getByLabelText("Login form")).not.toThrow();
  });

  it("renders inputs and labels", () => {
    render(<LoginForm />);

    expect(() => screen.getByText("Username:")).not.toThrow();
    expect(() => screen.getByText("Password:")).not.toThrow();
    expect(screen.getByLabelText("Password input").id).toBe("password");
    expect(screen.getByLabelText("Username input").id).toBe("username");
    expect(screen.getByLabelText("Password input").getAttribute("type")).toBe(
      "password"
    );
  });

  it("renders submit button", () => {
    render(<LoginForm />);

    const btn = screen.getByRole("button");

    expect(btn.getAttribute("type")).toBe("submit");
    expect(btn.parentNode).toBe(screen.getByLabelText("Login form"));
  });

  describe("validation logic", () => {
    it("displays required message on missing username when login is clicked", async () => {
      render(<LoginForm />);
      const user = userEvent.setup();

      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("randomPassword");
      await user.click(screen.getByRole("button"));

      expect(() => screen.getByText("Username can't be empty")).not.toThrow();
    });

    it("doesn't display required message on missing username when login isn't clicked", async () => {
      render(<LoginForm />);
      const user = userEvent.setup();

      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("randomPassword");

      expect(() => screen.getByText("Username can't be empty")).toThrow();
    });

    it("displays required message on missing password when login is clicked", async () => {
      render(<LoginForm />);
      const user = userEvent.setup();

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("randomUsername");
      await user.click(screen.getByRole("button"));

      expect(() => screen.getByText("Password can't be empty")).not.toThrow();
    });

    it("doesn't display required message on missing password when login isn't clicked", async () => {
      render(<LoginForm />);
      const user = userEvent.setup();

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("randomUsername");

      expect(() => screen.getByText("Password can't be empty")).toThrow();
    });

    it("removes missing username on second try if username is not empty", async () => {
      render(<LoginForm />);
      const user = userEvent.setup();

      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("randomPassword");

      await user.click(screen.getByRole("button"));

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("randomUsername");

      await user.click(screen.getByRole("button"));

      expect(() => screen.getByText("Username can't be empty")).toThrow();
    });

    it("removes missing password on second try if password is not empty", async () => {
      render(<LoginForm />);
      const user = userEvent.setup();

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("randomUsername");

      await user.click(screen.getByRole("button"));

      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("randomPassword");

      await user.click(screen.getByRole("button"));

      expect(() => screen.getByText("Password can't be empty")).toThrow();
    });

    it("removes missing username on second try if username is not empty", async () => {
      render(<LoginForm />);
      const user = userEvent.setup();

      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("randomPassword");

      await user.click(screen.getByRole("button"));

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("randomUsername");

      await user.click(screen.getByRole("button"));

      expect(() => screen.getByText("Username can't be empty")).toThrow();
    });

    it("removes both missing password and username msg on second try if password and username is not empty", async () => {
      render(<LoginForm />);
      const user = userEvent.setup();

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
      render(<LoginForm />);
      const user = userEvent.setup();

      await user.click(screen.getByRole("button"));

      expect(() => screen.getByText("Username can't be empty")).not.toThrow();
      expect(() => screen.getByText("Password can't be empty")).not.toThrow();
    });
  });

  describe("fetching logic", () => {
    it("doesn't call fetch when password is missing", async () => {
      render(<LoginForm />);
      const user = userEvent.setup();
      const spy = vitest.spyOn(global, "fetch");

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("randomUsername");
      await user.click(screen.getByRole("button"));

      expect(spy).not.toBeCalled();
    });

    it("doesn't call fetch when username is missing", async () => {
      render(<LoginForm />);
      const user = userEvent.setup();

      const spy = vitest.spyOn(global, "fetch");
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("randomPassword");
      await user.click(screen.getByRole("button"));

      expect(spy).not.toBeCalled();
    });

    it("doesn't call fetch when both username and password are missing", async () => {
      render(<LoginForm />);
      const user = userEvent.setup();
      const spy = vitest.spyOn(global, "fetch");

      await user.click(screen.getByRole("button"));

      expect(spy).not.toBeCalled();
    });

    it("replaces button for loading button", async () => {
      render(<LoginForm />);
      const user = userEvent.setup();

      const serverPromise = new Promise(() => null);
      server.use(
        loginHandler(async () => {
          await serverPromise;
        })
      );
      // so while loading  json fetching via button should not be available(replaced with not working button)

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("someUsername");
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("somePassword");

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("button").textContent).toBe("Loading...");
    });

    it("removes loading on internet connection error", async () => {
      render(<LoginForm />);
      const user = userEvent.setup();

      let promiseResolver;
      const serverPromise = new Promise((resolve) => {
        promiseResolver = resolve;
      });
      server.use(
        loginHandler(async () => {
          await serverPromise;
          return HttpResponse.error();
        })
      );

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("someUsername");
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("somePassword");

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("button").textContent).toBe("Loading...");
      expect(screen.getByRole("button").disabled).toBe(true);

      await act(async () => {
        promiseResolver();
      });

      expect(screen.getByRole("button").textContent).toBe("Login");
    });

    it("displays error message after failed fetch", async () => {
      render(<LoginForm />);
      const user = userEvent.setup();

      server.use(
        loginHandler(() => {
          return HttpResponse.error();
        })
      );

      expect(() => screen.getByTestId("login-server-error")).toThrow();

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("someUsername");
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("somePassword");

      await user.click(screen.getByRole("button"));

      expect(screen.getByTestId("login-server-error").textContent).toBe(
        "Error occurred: Please try again!"
      );
    });

    it("displays error message after unaccepted error codes", async () => {
      render(<LoginForm />);
      const user = userEvent.setup();

      server.use(
        loginHandler(async () => {
          return HttpResponse.json("Something went bad", { status: 400 });
        })
      );

      expect(() => screen.getByTestId("login-server-error")).toThrow();

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("someUsername");
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("somePassword");

      await user.click(screen.getByRole("button"));

      expect(screen.getByTestId("login-server-error").textContent).toBe(
        "Error occurred: Please try again!"
      );
    });

    it("calls callback when 200 status", async () => {
      const callbackMock = vitest.fn();

      render(<LoginForm callback={callbackMock} />);
      const user = userEvent.setup();

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("someUsername");
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("somePassword");

      await user.click(screen.getByRole("button"));

      expect(callbackMock).toBeCalledTimes(1);
    });

    it("doesn't call callback when 401 status", async () => {
      const callbackMock = vitest.fn();

      render(<LoginForm callback={callbackMock} />);
      const user = userEvent.setup();

      server.use(
        loginHandler(
          () => new HttpResponse("Missing credentials", { status: 401 })
        )
      );

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("someUsername");
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("somePassword");

      await user.click(screen.getByRole("button"));

      expect(callbackMock).not.toBeCalled();
    });
  });
});
