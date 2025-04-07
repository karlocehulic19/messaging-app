import PropTypes from "prop-types";
import { useProfilePicture } from "../hooks/useProfilePicture";
import SendIcon from "../icons/send-button.svg?react";
import styles from "./styles/MessagingInterface.module.css";
import customFetch from "../utils/customFetch";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import MessagesLoader from "./MessagesLoader";

export default function MessagingInterface({ receiverUsername }) {
  const { user, token } = useAuth();
  const profilePictureSrc = useProfilePicture(receiverUsername);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagingInput = useRef();

  const handleMessageSend = useCallback(() => {
    customFetch("/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sender: user.username,
        receiver: receiverUsername,
        message: message,
        clientTimestamp: new Date(),
      }),
    });

    setMessages((prev) => [
      ...prev,
      {
        sender: user.username,
        receiver: receiverUsername,
        date: new Date(),
        message,
      },
    ]);

    setMessage("");
  }, [user, message, receiverUsername, token]);

  useEffect(() => {
    const enterEventHandler = (e) => {
      if (e.code == "Enter") handleMessageSend();
    };
    const prevMsgInput = messagingInput.current;
    messagingInput.current.addEventListener("keydown", enterEventHandler);

    return () => prevMsgInput.removeEventListener("keydown", enterEventHandler);
  }, [handleMessageSend]);

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
      <MessagesLoader messages={messages} />
      <div id={styles["messaging-container"]}>
        <div id={styles["msg-action-container"]}>
          <input
            ref={messagingInput}
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
    </>
  );
}

MessagingInterface.propTypes = {
  receiverUsername: PropTypes.string.isRequired,
};
