import { describe, expect, vi } from "vitest";
import { screen, render, waitFor } from "@testing-library/react";
import SearchCard from "../SearchCard";
import { server } from "../../mocks/node";

server.listen();

global.URL.createObjectURL = vi.fn(() => {
  return "mockedDataURL";
});

describe("<SearchCard />", () => {
  it("renders correctly", async () => {
    render(<SearchCard username="Test" photoId="testid1" />);

    await waitFor(() => expect(global.URL.createObjectURL).toBeCalledTimes(1));

    expect(screen.getByLabelText("Test user")).toMatchSnapshot();
  });
});
