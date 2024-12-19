import LoginForm from "../LoginForm";
import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { config } from "../../Constants";
import { vitest } from "vitest";
import { server } from "../../mocks/node";
import { http, HttpResponse } from "msw";
import { useAuth } from "../../hooks/useAuth";

const loginHandler = (resolver) =>
  http.post(`${config.url.BACKEND_URL}/login`, resolver);

vitest.mock("../../hooks/useAuth");

beforeEach(() => {
  useAuth.mockImplementation(() => ({ loginAction: () => Promise.resolve() }));
});

afterEach(() => {
  vitest.clearAllMocks();
});

describe("<LoginForm />", () => {
  it("renders correctly", () => {
    render(<LoginForm callback={() => null} />);

    expect(() => screen.getByLabelText("Login form")).not.toThrow();
  });

  it("renders inputs with placeholders", () => {
    render(<LoginForm callback={() => null} />);

    expect(screen.getByLabelText("Password input").id).toBe("password");
    expect(screen.getByLabelText("Password input").placeholder).toBe(
      "Password"
    );
    expect(screen.getByLabelText("Username input").id).toBe("username");
    expect(screen.getByLabelText("Username input").placeholder).toBe(
      "Username"
    );
    expect(screen.getByLabelText("Password input").getAttribute("type")).toBe(
      "password"
    );
  });

  it("renders submit button", () => {
    render(<LoginForm callback={() => null} />);

    const btn = screen.getByRole("button");

    expect(btn.getAttribute("type")).toBe("submit");
    expect(btn.parentNode).toBe(screen.getByLabelText("Login form"));
  });

  describe("validation logic", () => {
    it("displays required message on missing username when login is clicked", async () => {
      render(<LoginForm callback={() => null} />);
      const user = userEvent.setup();

      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("randomPassword");
      await user.click(screen.getByRole("button"));

      expect(() => screen.getByText("Username can't be empty")).not.toThrow();
    });

    it("doesn't display required message on missing username when login isn't clicked", async () => {
      render(<LoginForm callback={() => null} />);
      const user = userEvent.setup();

      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("randomPassword");

      expect(() => screen.getByText("Username can't be empty")).toThrow();
    });

    it("displays required message on missing password when login is clicked", async () => {
      render(<LoginForm callback={() => null} />);
      const user = userEvent.setup();

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("randomUsername");
      await user.click(screen.getByRole("button"));

      expect(() => screen.getByText("Password can't be empty")).not.toThrow();
    });

    it("doesn't display required message on missing password when login isn't clicked", async () => {
      render(<LoginForm callback={() => null} />);
      const user = userEvent.setup();

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("randomUsername");

      expect(() => screen.getByText("Password can't be empty")).toThrow();
    });

    it("removes missing username on second try if username is not empty", async () => {
      render(<LoginForm callback={() => null} />);
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
      render(<LoginForm callback={() => null} />);
      const user = userEvent.setup();

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("randomUsername");

      await user.click(screen.getByRole("button"));

      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("randomPassword");

      await user.click(screen.getByRole("button"));

      expect(() => screen.getByText("Password can't be empty")).toThrow();
    });

    it("removes both missing password and username msg on second try if password and username is not empty", async () => {
      render(<LoginForm callback={() => null} />);
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
      render(<LoginForm callback={() => null} />);
      const user = userEvent.setup();

      await user.click(screen.getByRole("button"));

      expect(() => screen.getByText("Username can't be empty")).not.toThrow();
      expect(() => screen.getByText("Password can't be empty")).not.toThrow();
    });
  });

  describe("fetching logic", () => {
    it("doesn't call loginAction when password is missing", async () => {
      const mockLoginAction = vitest.fn();
      useAuth.mockImplementation(() => ({ loginAction: mockLoginAction }));
      render(<LoginForm callback={() => null} />);
      const user = userEvent.setup();

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("randomUsername");
      await user.click(screen.getByRole("button"));

      expect(mockLoginAction).not.toBeCalled();
    });

    it("doesn't call fetch when username is missing", async () => {
      const mockLoginAction = vitest.fn();
      useAuth.mockImplementation(() => ({ loginAction: mockLoginAction }));
      render(<LoginForm callback={() => null} />);
      const user = userEvent.setup();

      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("randomPassword");
      await user.click(screen.getByRole("button"));

      expect(mockLoginAction).not.toBeCalled();
    });

    it("doesn't call fetch when both username and password are missing", async () => {
      const mockLoginAction = vitest.fn();
      useAuth.mockImplementation(() => ({ loginAction: mockLoginAction }));
      render(<LoginForm callback={() => null} />);
      const user = userEvent.setup();

      await user.click(screen.getByRole("button"));

      expect(mockLoginAction).not.toBeCalled();
    });

    it("replaces button for loading button", async () => {
      useAuth.mockImplementation(() => ({
        loginAction: () => new Promise(() => null),
      }));
      render(<LoginForm callback={() => null} />);
      const user = userEvent.setup();
      // so while loading  json fetching via button should not be available(replaced with not working button)

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("someUsername");
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("somePassword");

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("button").textContent).toBe("Loading...");
    });

    it("removes loading on loginAction throwing error", async () => {
      useAuth.mockImplementation(() => ({
        loginAction: () => Promise.reject(),
      }));
      render(<LoginForm callback={() => null} />);
      const user = userEvent.setup();

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("someUsername");
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("somePassword");

      expect(screen.getByRole("button").textContent).toBe("Login");
    });

    it("displays error message after failed loginAction", async () => {
      useAuth.mockImplementation(() => ({
        loginAction: () =>
          Promise.reject("Some error that should be consoled!"),
      }));
      render(<LoginForm callback={() => null} />);
      const user = userEvent.setup();

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

    it("calls callback when login is correct", async () => {
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

    it("doesn't call callback when messages are present", async () => {
      const callbackMock = vitest.fn();
      useAuth.mockImplementation(() => ({
        loginAction: () => Promise.resolve(["Some validation error message"]),
      }));
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

    it("Loads up api messages", async () => {
      useAuth.mockImplementation(() => ({
        loginAction: () => Promise.resolve(["Login message"]),
      }));
      render(<LoginForm callback={() => null} />);
      const user = userEvent.setup();

      await user.click(screen.getByLabelText("Username input"));
      await user.keyboard("userThatIsNotInDb");
      await user.click(screen.getByLabelText("Password input"));
      await user.keyboard("somePassword");

      await user.click(screen.getByRole("button"));

      expect(screen.getByLabelText("Login message")).toBeInTheDocument();
    });
  });
});
