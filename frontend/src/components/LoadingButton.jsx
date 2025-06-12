import PropTypes from "prop-types";

function LoadingButton({ loading, customProps = {}, children }) {
  return (
    <button {...customProps} disabled={loading}>
      {loading ? "Loading..." : children}
    </button>
  );
}

LoadingButton.propTypes = {
  loading: PropTypes.bool.isRequired,
  customProps: PropTypes.object,
  children: PropTypes.node.isRequired,
};

export default LoadingButton;
