import { render, screen, act } from "@testing-library/react";
import RegisterForm from "../RegisterForm";
import { expect, describe, it, vi, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";

const mockedNavigate = vi.fn();
const mockedPNGFile = new File(["test"], "test.png", { type: "image/png" });
const mockedJPEGFile = new File(["test"], "test.jpeg", { type: "image/jpeg" });
const mockedInvalidFile = new File(["test"], "test.txt", {
  type: "application/json",
});

vi.mock("react-router-dom", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    useNavigate: () => mockedNavigate,
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

const setup = async () => {
  render(<RegisterForm />);
  const user = userEvent.setup();

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
  render(<RegisterForm />);
  const user = userEvent.setup();

  await user.click(screen.getByPlaceholderText("Email"));
  await user.keyboard("karlocehlic@gmail");

  await user.click(screen.getByPlaceholderText("Password"));
  await user.keyboard("V4l1dP4ssw@rd");

  await user.click(screen.getByPlaceholderText("Confirm Password"));
  await user.keyboard("V4l1dP4ssw@r");

  return { user };
};

const setupInvalidFile = async () => {
  const { user } = setup();

  console.log(screen.getByTestId("picture-input").id);
  await user.upload(screen.getByTestId("picture-input"), mockedInvalidFile);

  console.log(screen.getByTestId("picture-input").id);

  return { user };
};

describe("<RegisterForm></RegisterForm>", () => {
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

    it("renders validation errors after pressing on register", async () => {
      render(<RegisterForm />);
      const user = userEvent.setup();

      await user.click(screen.getByRole("button"));
      expect(screen.getAllByTestId("validation-msg")).toMatchSnapshot();
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
  });
  describe("picture-dropzone", () => {
    it("displays error message on invalid file type", async () => {
      render(<RegisterForm />);
      const user = userEvent.setup({ applyAccept: false });

      await user.upload(screen.getByTestId("picture-input"), mockedInvalidFile);

      expect(
        screen.getByText("Please select image that is in PNG or JPEG format")
      ).toBeInTheDocument();
    });

    it("doesn't displays error message on PNG file type", async () => {
      const user = userEvent.setup({ applyAccept: false });
      render(<RegisterForm />);

      await user.upload(screen.getByTestId("picture-input"), mockedPNGFile);

      expect(
        screen.queryByText("Please select image that is in PNG or JPEG format")
      ).toBeNull();
    });

    it("doesn't displays error message on JPEG file type", async () => {
      const user = userEvent.setup({ applyAccept: false });
      render(<RegisterForm />);

      await user.upload(screen.getByTestId("picture-input"), mockedJPEGFile);

      expect(
        screen.queryByText("Please select image that is in PNG or JPEG format")
      ).toBeNull();
    });
  });
});
