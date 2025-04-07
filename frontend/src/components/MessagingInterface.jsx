import PropTypes from "prop-types";
import { useProfilePicture } from "../hooks/useProfilePicture";
import styles from "./styles/MessagingInterface.module.css";
import customFetch from "../utils/customFetch";
import { useState, useRef, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import MessagesLoader from "./MessagesLoader";
import ErrorPopup from "./ErrorPopup";
import apiErrorLogger from "../utils/apiErrorLogger";
import MessageSendActions from "./MessageSendActions";

export default function MessagingInterface({ receiverUsername }) {
  const { user, token } = useAuth();
  const profilePictureSrc = useProfilePicture(receiverUsername);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const errorPopup = useRef();

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
    })
      .then((response) => response.json())
      .then((receivedMessages) => {
        setMessages((prev) => [...prev, ...receivedMessages]);
        setMessages((prev) => {
          return [
            ...prev,
            {
              sender: user.username,
              receiver: receiverUsername,
              date: new Date(),
              message,
            },
          ];
        });
        setMessage("");
      })
      .catch((error) => {
        errorPopup.current.toggle();
        apiErrorLogger(error);
      });
  }, [user, message, receiverUsername, token]);

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
      <ErrorPopup ref={errorPopup} />
      <MessagesLoader messages={messages} />
      <MessageSendActions
        setMessage={setMessage}
        message={message}
        handleMessageSend={handleMessageSend}
      />
    </>
  );
}

MessagingInterface.propTypes = {
  receiverUsername: PropTypes.string.isRequired,
};
