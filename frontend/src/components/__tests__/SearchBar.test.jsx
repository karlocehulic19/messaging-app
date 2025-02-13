import { describe, expect, vi } from "vitest";
import { screen, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "../SearchBar";
import { server } from "../../mocks/node";
import * as customFetch from "../../utils/customFetch";
import { BrowserRouter } from "react-router-dom";

server.listen();

describe("<SearchBar />", () => {
  it("renders correctly", () => {
    render(<SearchBar />);
    expect(screen.getByRole("search")).toMatchSnapshot();
  });

  it("display possible search candidates", async () => {
    render(<SearchBar />, { wrapper: BrowserRouter });
    const user = userEvent.setup();

    const customFetchSpy = vi.spyOn(customFetch, "default");

    await user.click(screen.getByRole("searchbox"));
    await user.keyboard("t");

    await waitFor(() => expect(customFetchSpy).toBeCalledWith("/users?s=t"), {
      timeout: 2010,
    });

    const usersFetch = customFetchSpy.mock.calls.filter((call) =>
      call[0].includes("?s=")
    );

    expect(usersFetch.length).toBe(1);
    expect(screen.getByLabelText("Found users")).toMatchSnapshot();
  });
});
