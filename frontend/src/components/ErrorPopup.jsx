import PropTypes from "prop-types";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

const ErrorPopup = forwardRef(
  ({ text = "An unexpected error occurred.", delay = 5000 }, ref) => {
    const [toggle, setToggle] = useState();
    const timer = useRef(null);

    useImperativeHandle(
      ref,
      () => ({
        toggle: () => {
          setToggle(true);
          if (timer.current) {
            clearTimeout(timer.current);
          }
          timer.current = setTimeout(() => setToggle(false), delay);
        },
      }),
      [delay]
    );

    return (
      <>
        {toggle && (
          <div aria-label="Error message">
            <p>{text}</p>
          </div>
        )}
      </>
    );
  }
);

ErrorPopup.propTypes = {
  text: PropTypes.string,
  delay: PropTypes.bool,
};

ErrorPopup.displayName = "ErrorPopup";

export default ErrorPopup;
