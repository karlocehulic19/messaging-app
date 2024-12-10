import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "@testing-library/user-event";
import Register from "../Register";

const mockedNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    useNavigate: () => mockedNavigate,
  };
});

vi.mock("../../components/RegisterForm", () => {
  return {
    default: () => {
      return <p data-testid={"register-form"}>Reg Form</p>;
    },
  };
});

afterEach(() => {
  vi.resetAllMocks();
});

describe("<Register></Register>", () => {
  it("renders register title", () => {
    render(<Register></Register>);

    expect(screen.getByRole("heading").textContent).toBe("Register");
  });

  it("renders register form", () => {
    render(<Register></Register>);
    expect(screen.getByTestId("register-form")).toBeInTheDocument();
  });

  it("renders login redirection", () => {
    render(<Register></Register>);

    expect(screen.getByLabelText("Link to login")).toBeInTheDocument();
  });

  it("redirects to login when login link is clicked", async () => {
    render(<Register></Register>);
    const user = userEvent.setup();

    await user.click(screen.getByLabelText("Link to login"));

    expect(mockedNavigate).toBeCalledTimes(1);
  });

  it("doesn't redirect when link is not clicked", () => {
    render(<Register></Register>);

    expect(mockedNavigate).toBeCalledTimes(0);
  });
});
