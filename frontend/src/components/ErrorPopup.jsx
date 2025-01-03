import PropTypes from "prop-types";
import { useEffect } from "react";

function ErrorPopup({
  text = "An unexpected error occurred.",
  onClose,
  toggle,
  delay = 5000,
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, delay);

    return () => clearTimeout(timer);
  }, [delay, onClose]);

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

ErrorPopup.propTypes = {
  text: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  toggle: PropTypes.bool.isRequired,
  delay: PropTypes.bool,
};

export default ErrorPopup;
