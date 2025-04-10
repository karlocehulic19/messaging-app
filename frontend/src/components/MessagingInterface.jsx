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
import { useMessagePooling } from "../hooks/useMessagePooling";

export default function MessagingInterface({ receiverUsername }) {
  const { user } = useAuth();
  const profilePictureSrc = useProfilePicture(receiverUsername);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  useMessagePooling(receiverUsername, setMessages);
  const errorPopup = useRef();

  const handleMessageSend = useCallback(() => {
    if (message !== "") {
      customFetch("/messages", {
        method: "POST",
        body: JSON.stringify({
          sender: user.username,
          receiver: receiverUsername,
          message: message,
          clientTimestamp: new Date(),
        }),
      })
        .then((response) => response.json())
        .then((receivedMessages) => {
          setMessages((prev) => [
            ...prev,
            ...receivedMessages.map((msg) => ({
              date: msg.date,
              message: msg.message,
              sender: receiverUsername,
              receiver: user.username,
            })),
          ]);
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
    }
  }, [user, message, receiverUsername]);

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
