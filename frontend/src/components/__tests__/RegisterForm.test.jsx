import { cleanup, render, screen, act } from "@testing-library/react";
import RegisterForm from "../RegisterForm";
import { expect, describe, it, vi, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import "../../mocks/URL";
import { server } from "../../mocks/node";
import { config } from "../../Constants";
import { HttpResponse, http } from "msw";
import { readFileSync } from "node:fs";
import path from "node:path";
import convertSquare from "../../utils/convertSquare";

const mockedNavigate = vi.fn();
server.listen();

const registerHandler = (resolver) =>
  http.post(`${config.url.BACKEND_URL}/register`, resolver);

const resolver500 = () =>
  HttpResponse.json({ error: "Internal Server Error" }, { status: 500 });

const resolver422 = () =>
  HttpResponse.json(
    {
      message: ["First validation message", "Second validation message"],
    },
    { status: 422 }
  );
vi.mock("react-router-dom", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    useNavigate: () => mockedNavigate,
  };
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

const setup = async (userEventOptions = {}) => {
  const user = userEvent.setup(userEventOptions);
  render(<RegisterForm />);

  await user.click(screen.getByPlaceholderText("Username"));
  await user.keyboard("test");

  await user.click(screen.getByPlaceholderText("First Name"));
  await user.keyboard("Karlo");

  await user.click(screen.getByPlaceholderText("Last Name"));
  await user.keyboard("Čehulić");

  await user.click(screen.getByPlaceholderText("Email"));
  await user.keyboard("karlocehlic@gmail.com");

  await user.click(screen.getByPlaceholderText("Password"));
  await user.keyboard("V4l1dP4ssw@rd");

  await user.click(screen.getByPlaceholderText("Confirm Password"));
  await user.keyboard("V4l1dP4ssw@rd");

  return { user };
};

const setupNearlyCorrect = async () => {
  const user = userEvent.setup();
  render(<RegisterForm />);

  await user.click(screen.getByPlaceholderText("Email"));
  await user.keyboard("karlocehlic@gmail");

  await user.click(screen.getByPlaceholderText("Password"));
  await user.keyboard("V4l1dP4ssw@rd");

  await user.click(screen.getByPlaceholderText("Confirm Password"));
  await user.keyboard("V4l1dP4ssw@r");

  return { user };
};

it("renders form with right attributes", () => {
  render(<RegisterForm />);

  expect(screen.getByRole("form").attributes).toMatchSnapshot();
});

it("renders labels with right attribute", () => {
  render(<RegisterForm />);
  expect(
    screen.getAllByTestId("input-label").map((ele) => ele.attributes)
  ).toMatchSnapshot();
});

it("renders empty inputs correctly(non-password)", () => {
  render(<RegisterForm />);
  expect(screen.getAllByRole("textbox")).toMatchSnapshot();
});

it("renders empty inputs correctly(password)", () => {
  render(<RegisterForm />);
  expect(screen.getAllByTestId("pw-input")).toMatchSnapshot();
});

describe("validation logic", () => {
  it("doesn't render validation errors after first render", () => {
    render(<RegisterForm />);

    expect(screen.queryAllByTestId("validation-msg")).toEqual([]);
  });

  it("renders validation errors after interacting with input", async () => {
    render(<RegisterForm />);
    const user = userEvent.setup();

    await user.click(screen.getByPlaceholderText("Username"));

    await user.keyboard("a");

    expect(screen.getAllByTestId("validation-msg")).toMatchSnapshot();
  });

  it("renders validation errors after interacting with any input", async () => {
    render(<RegisterForm />);
    const user = userEvent.setup();

    await user.click(screen.getByPlaceholderText("Password"));
    await user.keyboard("a");

    expect(screen.getAllByTestId("validation-msg")).toMatchSnapshot();
  });

  it("doesn't redirect after only clicking on register", async () => {
    render(<RegisterForm />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button"));

    expect(mockedNavigate).not.toBeCalled();
  });

  it("redirects after right validation", async () => {
    const { user } = await setup();

    await user.click(screen.getByRole("button"));
    expect(mockedNavigate).toBeCalledTimes(1);
    expect(mockedNavigate).toBeCalledWith("/login");
  });

  it("doesn't redirect after wrong validation", async () => {
    const { user } = await setup();

    await user.click(screen.getByPlaceholderText("Confirm Password"));
    await user.keyboard("1");
    await user.click(screen.getByRole("button"));

    expect(mockedNavigate).toBeCalledTimes(0);
  });

  it("renders one invalid input correctly(passConfirmation)", async () => {
    const { user } = await setup();

    await user.click(screen.getByPlaceholderText("Confirm Password"));
    await user.keyboard("1");
    await user.click(screen.getByRole("button"));

    expect(screen.getByTestId("validation-msg")).toMatchSnapshot();
  });

  it("renders many invalid inputs correctly(all of them in nearly correct setup)", async () => {
    const { user } = await setupNearlyCorrect();
    await user.click(screen.getByRole("button"));

    expect(screen.getAllByTestId("validation-msg")).toMatchSnapshot();
  });

  it("makes register button disabled with wrong validation", async () => {
    render(<RegisterForm />);

    expect(screen.getByRole("button")).toBeDisabled();

    cleanup();

    await setupNearlyCorrect();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

describe("fetching logic", () => {
  it("redirects after ok response", async () => {
    const { user } = await setup();
    await user.click(screen.getByRole("button"));

    expect(mockedNavigate).toHaveBeenCalledOnce();
  });

  it("doesn't redirect after bad responses", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    server.use(registerHandler(resolver500));
    const { user: user1 } = await setup();

    await user1.click(screen.getByRole("button"));

    expect(mockedNavigate).not.toHaveBeenCalled();

    cleanup();

    server.use(registerHandler(resolver422));
    const { user: user2 } = await setup();
    await user2.click(screen.getByRole("button"));

    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it("doesn't displays an error popup on meant requests", async () => {
    const { user: user1 } = await setup();
    await user1.click(screen.getByRole("button"));

    expect(screen.queryByLabelText("Error message")).not.toBeInTheDocument();

    cleanup();

    const { user: user2 } = await setup();
    server.use(registerHandler(resolver422));
    await user2.click(screen.getByRole("button"));

    expect(screen.queryByLabelText("Error message")).not.toBeInTheDocument();
  });

  it("displays an error popup on failed requests", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { user } = await setup();
    server.use(registerHandler(resolver500));
    await user.click(screen.getByRole("button"));

    expect(screen.getByLabelText("Error message")).toMatchSnapshot();
  });

  it("displays an error popup on failed network request", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    server.use(registerHandler(() => HttpResponse.error()));
    const { user } = await setup();

    await user.click(screen.getByRole("button"));

    expect(screen.getByLabelText("Error message")).toMatchSnapshot();
  });

  it("displays validation messages on 422", async () => {
    server.use(registerHandler(resolver422));
    const { user } = await setup();

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("First validation message")).toMatchSnapshot();
    expect(screen.getByText("Second validation message")).toMatchSnapshot();
  });

  it("displays validation messages anything other than 400", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { user: user1 } = await setup();

    await user1.click(screen.getByRole("button"));

    expect(screen.queryByText("First validation message")).toBeNull();
    expect(screen.queryByText("Second validation message")).toBeNull();

    cleanup();

    server.use(registerHandler(resolver500));
    const { user: user2 } = await setup();

    await user2.click(screen.getByRole("button"));

    expect(screen.queryByText("First validation message")).toBeNull();
    expect(screen.queryByText("Second validation message")).toBeNull();
  });

  it("disables register button until request is received", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    let requestResolver;

    server.use(
      registerHandler(
        async () =>
          await new Promise((resolve) => {
            requestResolver = () => resolve(HttpResponse.error());
          })
      )
    );

    const { user } = await setup();
    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toBeDisabled();

    await act(async () => {
      requestResolver();
    });

    expect(screen.getByRole("button")).toBeEnabled();
  });

  it("sets register button text to loading request is received", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    let requestResolver;

    server.use(
      registerHandler(
        async () =>
          await new Promise((resolve) => {
            requestResolver = () => resolve(HttpResponse.error());
          })
      )
    );

    const { user } = await setup();
    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("button").textContent).toBe("Loading...");

    await act(async () => {
      requestResolver();
    });

    expect(screen.getByRole("button").textContent).toBe("Register");
  });

  describe("profile picture", () => {
    it("calls api with formatted base64 of included picture", async () => {
      const { user } = await setup();
      const fetchSpy = vi.spyOn(global, "fetch");
      const jpgBuffer = readFileSync(
        // eslint-disable-next-line no-undef
        path.resolve(__dirname, "../../tests/assets/jpg-file.jpg")
      );
      const jpgTestFile = new File([jpgBuffer], "test.jpg", {
        type: "image/jpeg",
      });

      await user.upload(screen.getByTestId("picture-input"), jpgTestFile);
      await user.click(screen.getByLabelText("Submit Button"));

      expect(fetchSpy).toBeCalledTimes(1);
      expect(fetchSpy).toBeCalledWith(`${config.url.BACKEND_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "test",
          firstName: "Karlo",
          lastName: "Čehulić",
          email: "karlocehlic@gmail.com",
          password: "V4l1dP4ssw@rd",
          pictureBase64: await convertSquare(jpgBuffer, "image/jpeg"),
        }),
      });
    });

    it("doesn't call api with formatted base64 when pic not selected", async () => {
      const { user } = await setup();
      const fetchSpy = vi.spyOn(global, "fetch");
      await user.click(screen.getByLabelText("Submit Button"));

      expect(fetchSpy).toBeCalledTimes(1);
      expect(fetchSpy).toBeCalledWith(`${config.url.BACKEND_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "test",
          firstName: "Karlo",
          lastName: "Čehulić",
          email: "karlocehlic@gmail.com",
          password: "V4l1dP4ssw@rd",
        }),
      });
    });

    it("doesn't call api with formatted base64 when pic is removed", async () => {
      const { user } = await setup();
      const fetchSpy = vi.spyOn(global, "fetch");
      const jpgBuffer = readFileSync(
        // eslint-disable-next-line no-undef
        path.resolve(__dirname, "../../tests/assets/jpg-file.jpg")
      );
      const jpgTestFile = new File([jpgBuffer], "test.jpg", {
        type: "image/jpeg",
      });

      await user.upload(screen.getByTestId("picture-input"), jpgTestFile);

      await user.click(screen.getByLabelText("Remove Picture"));

      await user.click(screen.getByLabelText("Submit Button"));

      expect(fetchSpy).toBeCalledTimes(1);
      expect(fetchSpy).toBeCalledWith(`${config.url.BACKEND_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "test",
          firstName: "Karlo",
          lastName: "Čehulić",
          email: "karlocehlic@gmail.com",
          password: "V4l1dP4ssw@rd",
        }),
      });
    });
  });
});
