import PropTypes from "prop-types";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

const ErrorPopup = forwardRef(
  ({ text = "An unexpected error occurred.", delay = 5000 }, ref) => {
    const [toggle, setToggle] = useState();
    const timer = useRef(null);
    const [messages, setMessage] = useState([text]);

    useImperativeHandle(
      ref,
      () => ({
        toggle: (newMessage) => {
          setToggle(true);
          if (newMessage) setMessage(newMessage);
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
          <div role="alert" aria-label="Error message" className="error-popup">
            {messages.map((msg) => (
              <p key={msg}>{msg}</p>
            ))}
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
