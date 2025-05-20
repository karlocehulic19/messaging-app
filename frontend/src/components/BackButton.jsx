import BackIcon from "../icons/back-icon.svg?react";
import styles from "./styles/BackButton.module.css";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.history.length == 1) {
      navigate("/");
      return;
    }

    navigate(-1);
  };

  return (
    <button
      aria-label="Back button"
      className={styles["back-button"]}
      onClick={handleClick}
    >
      <BackIcon />
    </button>
  );
}
