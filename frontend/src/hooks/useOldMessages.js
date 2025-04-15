import { useEffect } from "react";
import customFetch from "../utils/customFetch";
import { useAuth } from "./useAuth";

export const useOldMessages = (partnerUsername, setMessages) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();
    customFetch(
      `/messages/old?user=${user.username}&partner=${partnerUsername}`,
      {
        signal: controller.signal,
      }
    )
      .then((res) => res.json())
      .then((oldMessages) =>
        setMessages((prevMessages) => [...oldMessages, ...prevMessages])
      );

    return () => controller.abort();
  }, [partnerUsername, user, setMessages]);
};
