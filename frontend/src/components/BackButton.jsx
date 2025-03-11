import { Link } from "react-router-dom";
import BackIcon from "../icons/back-icon.svg?react";
import styles from "./styles/BackButton.module.css";

export default function BackButton() {
  return (
    <Link className={styles["back-button"]} to={"/"}>
      <BackIcon />
    </Link>
  );
}
