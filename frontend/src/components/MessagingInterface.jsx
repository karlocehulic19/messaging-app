import PropTypes from "prop-types";
import { useProfilePicture } from "../hooks/useProfilePicture";
import SendIcon from "../icons/send-button.svg?react";
import styles from "./styles/MessagingInterface.module.css";

export default function MessagingInterface({ receiverUsername }) {
  const profilePictureSrc = useProfilePicture(receiverUsername);

  return (
    <>
      <header id={styles["receiver-header"]}>
        <img
          className={styles["receiver-img"]}
          src={profilePictureSrc}
          alt={`${receiverUsername}'s profile picture`}
        />
        <h1>{receiverUsername}</h1>
      </header>
      <div id={styles["messaging-container"]}>
        <div id={styles["msg-action-container"]}>
          <input
            id={styles["message-input"]}
            type="text"
            aria-label="Message input"
          />
          <button id={styles["send-button"]} aria-label="Send button">
            <SendIcon className={styles["send-icon"]} />
          </button>
        </div>
      </div>
    </>
  );
}

MessagingInterface.propTypes = {
  receiverUsername: PropTypes.string.isRequired,
};
