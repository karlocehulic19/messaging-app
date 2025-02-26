import "../index.css";
import { useState, useRef } from "react";
import styles from "./styles/OptionsButton.module.css";
import { Link } from "react-router-dom";
import OptionsIcon from "../icons/options-button.svg?react";

export default function OptionsButton() {
  const [opened, setOpened] = useState(false);
  const optMenu = useRef();

  function handleClick(e) {
    e.preventDefault();
    setOpened(true);
  }

  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setOpened(false);
    }
  };

  const closeOptMenu = (e) => {
    if (!optMenu.current?.contains(e.target)) {
      setOpened(false);
    }
  };

  document.addEventListener("mousedown", closeOptMenu);
  return (
    <div id={styles["options-menu"]}>
      <a
        href="#"
        id={styles["options-button"]}
        onClick={handleClick}
        aria-label="Options button"
      >
        {<OptionsIcon />}
      </a>
      {opened && (
        <div
          ref={optMenu}
          onBlur={handleBlur}
          id={styles["options-container"]}
          aria-label="Option actions"
        >
          <Link tabIndex={0} to="/settings">
            Settings
          </Link>
          <Link id={styles["logout-button"]} tabIndex={0} to="/logout">
            Log Out
          </Link>
        </div>
      )}
    </div>
  );
}
