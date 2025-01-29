import { describe, expect } from "vitest";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "../SearchBar";

describe("<SearchBar />", () => {
  it("renders correctly", () => {
    render(<SearchBar />);
    expect(screen.getByRole("search")).toMatchSnapshot();
  });

  it("display possible search candidates", async () => {
    render(<SearchBar />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("searchbox"));
    await user.keyboard("t");

    expect(screen.getByLabelText("Found users")).toMatchSnapshot();
  });
});
