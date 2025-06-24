import { useCallback, useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import customFetch from "../utils/customFetch";
import apiErrorLogger from "../utils/apiErrorLogger";

export const useScrollingMessages = (
  partnerUsername,
  setMessages,
  totalMessagesNumber
) => {
  const [loading, setLoading] = useState(false);
  const [isAllLoaded, setIsAllLoaded] = useState(false);
  const { user } = useAuth();

  const SCROLL_OFFSET = 20;

  useEffect(() => {
    setIsAllLoaded(false);
    setLoading(false);
  }, [partnerUsername]);

  const handleScrollingMessages = useCallback(
    (e) => {
      if (e.target.scrollTop <= SCROLL_OFFSET) {
        if (loading || isAllLoaded) return;
        setLoading(true);
        customFetch(
          `/messages/old?partner=${partnerUsername}&user=${user.username}&pos=${totalMessagesNumber}`
        )
          .then((res) => res.json())
          .then((scrolledMessages) => {
            if (scrolledMessages.length == 0) {
              setIsAllLoaded(true);
              return;
            }
            setMessages((prevMessages) => {
              return [...scrolledMessages, ...prevMessages];
            });
          })
          .catch(apiErrorLogger)
          .finally(() => {
            setLoading(false);
            const prevScrollHeight = e.target.scrollHeight;
            setTimeout(() => {
              e.target.scrollTop = e.target.scrollHeight - prevScrollHeight;
            }, 0);
          });
      }
    },
    [
      partnerUsername,
      user,
      setMessages,
      loading,
      totalMessagesNumber,
      isAllLoaded,
    ]
  );

  return { handleScrollingMessages, loading };
};
