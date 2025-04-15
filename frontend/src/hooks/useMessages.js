import { useEffect, useState } from "react";
import { useOldMessages } from "./useOldMessages";
import { useMessagePooling } from "./useMessagePooling";

export const useMessages = (partnerUsername) => {
  const [message, setMessages] = useState([]);
  useOldMessages(partnerUsername, setMessages);
  useMessagePooling(partnerUsername, setMessages);

  useEffect(() => {
    setMessages([]);
  }, [partnerUsername]);

  return [message, setMessages];
};
