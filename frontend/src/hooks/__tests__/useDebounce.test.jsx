import { beforeEach, describe, expect, vi } from "vitest";
import useDebounce from "../useDebounce";
import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockedChangeFunc = vi.fn();

// eslint-disable-next-line react/prop-types
const TestingComponent = ({ time = 500 }) => {
  const [changingState, setChangingState] = useState("");
  useDebounce(mockedChangeFunc, time, changingState);

  return (
    <>
      <input
        data-testid={"test-inp"}
        value={changingState}
        onChange={(e) => setChangingState(e.target.value)}
        type="text"
        name="test-inp"
        id="test-inp"
      />
    </>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useDebounce()", () => {
  it("calls function on one state change", async () => {
    render(<TestingComponent />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId("test-inp"));
    await user.keyboard("a");

    await waitFor(() => expect(mockedChangeFunc).toBeCalledTimes(1));
  });

  it("calls function only once on fast state changes", async () => {
    render(<TestingComponent />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId("test-inp"));
    await user.keyboard("a");
    await user.keyboard("bcd");

    await waitFor(() => expect(mockedChangeFunc).toBeCalledTimes(1));
  });
});
