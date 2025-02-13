// whats the functionality
// mainly for making queries happen on some delta time
// any particular patter that I should use

import { useEffect, useRef } from "react";

// seconds

export default function useDebounce(callFunction, intervalTime, changingState) {
  const prevTimeout = useRef();

  useEffect(() => {
    prevTimeout.current = setTimeout(callFunction, intervalTime);

    return () => {
      clearTimeout(prevTimeout.current);
    };
  }, [changingState, callFunction, intervalTime]);

  useEffect(() => {
    clearTimeout(prevTimeout.current);
  }, []);
}
