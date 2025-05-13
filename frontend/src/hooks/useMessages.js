import { useEffect, useState } from "react";
import { useOldMessages } from "./useOldMessages";
import { useMessagePooling } from "./useMessagePooling";
import { useScrollingMessages } from "./useScrollingMessages";

export const useMessages = (partnerUsername) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([]);
  }, [partnerUsername]);

  useOldMessages(partnerUsername, setMessages);
  useMessagePooling(partnerUsername, setMessages);

  const scrollUtils = useScrollingMessages(
    partnerUsername,
    setMessages,
    messages.length
  );

  const addMessages = (newMessages) => {
    setMessages((prevMessages) => [...prevMessages, ...newMessages]);
  };

  return { messages, addMessages, ...scrollUtils };
};
