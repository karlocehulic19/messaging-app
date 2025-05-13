import { useCallback, useState } from "react";
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

  const handleScrollingMessages = useCallback(
    (e) => {
      if (e.target.scrollTop == 0) {
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
