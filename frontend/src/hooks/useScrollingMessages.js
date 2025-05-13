import { useCallback, useState, useRef } from "react";
import { useAuth } from "./useAuth";
import customFetch from "../utils/customFetch";

export const useScrollingMessages = (partnerUsername, setMessages) => {
  const [loading, setLoading] = useState(false);
  const page = useRef(2);
  const { user } = useAuth();

  const handleScrollingMessages = useCallback(
    (e) => {
      if (e.target.scrollTop == 0) {
        if (loading || page.current == -1) return;
        setLoading(true);
        customFetch(
          `/messages/old?partner=${partnerUsername}&user=${
            user.username
          }&page=${2}`
        )
          .then((res) => res.json())
          .then((scrolledMessages) => {
            if (scrolledMessages.length == 0) {
              page.current = -1;
              return;
            }
            page.current++;
            setMessages((prevMessages) => {
              return [...scrolledMessages, ...prevMessages];
            });
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
    [partnerUsername, user, setMessages, loading]
  );

  return { handleScrollingMessages, loading };
};
