import { useEffect } from "react";
import customFetch from "../utils/customFetch";
import apiErrorLogger from "../utils/apiErrorLogger";
import { useAuth } from "./useAuth";
import { POOLING_INTERVAL_TIME_SECONDS } from "../Constants";

export const useMessagePooling = (receiverUsername, setMessages) => {
  const { user } = useAuth();

  useEffect(() => {
    // user can initially be undefined but after /validate it gets set
    if (!user) return;
    const poolFetch = () =>
      customFetch(
        `/messages?receiver=${user.username}&sender=${receiverUsername}`
      )
        .then((res) => {
          if (res.status == 200) return res.json();
          if (res.status == 204) throw new Error("No new messages found");
        })
        .then((receivedMessages) => {
          setMessages((prev) => [...prev, ...receivedMessages]);
        })
        .catch((error) => apiErrorLogger(error));

    poolFetch();
    const poolingInterval = setInterval(
      poolFetch,
      POOLING_INTERVAL_TIME_SECONDS * 1000
    );

    return () => clearInterval(poolingInterval);
  }, [receiverUsername, user, setMessages]);
};
