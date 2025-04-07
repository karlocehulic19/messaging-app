import styles from "./styles/MessagingInterface.module.css";
import SendIcon from "../icons/send-button.svg?react";
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

export default function MessageSendActions({
  handleMessageSend,
  message,
  setMessage,
}) {
  const messageInput = useRef();

  useEffect(() => {
    const enterEventHandler = (e) => {
      if (e.code == "Enter") handleMessageSend();
    };
    const prevMsgInput = messageInput.current;
    messageInput.current.addEventListener("keydown", enterEventHandler);

    return () => prevMsgInput.removeEventListener("keydown", enterEventHandler);
  }, [handleMessageSend]);

  return (
    <div id={styles["messaging-container"]}>
      <div id={styles["msg-action-container"]}>
        <input
          ref={messageInput}
          onSubmit={handleMessageSend}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          id={styles["message-input"]}
          type="text"
          aria-label="Message input"
          placeholder="Type your message here..."
        />
        <button
          onClick={handleMessageSend}
          id={styles["send-button"]}
          aria-label="Send button"
        >
          <SendIcon className={styles["send-icon"]} />
        </button>
      </div>
    </div>
  );
}

MessageSendActions.propTypes = {
  handleMessageSend: PropTypes.func.isRequired,
  setMessage: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
};
