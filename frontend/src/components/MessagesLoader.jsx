import PropTypes from "prop-types";
import { format } from "date-fns";
import { uniqueId } from "lodash";
import { useAuth } from "../hooks/useAuth";
import { Fragment, useEffect, useRef } from "react";
import styles from "./styles/MessagesLoader.module.css";

const MS_IN_DAY = 1000 * 60 * 60 * 24;

function getMessageDateTag(date) {
  const dateTag = format(new Date(date), "MMM do");
  if (format(new Date(), "MMM do") === dateTag) return "Today";
  if (format(new Date() - MS_IN_DAY, "MMM do") === dateTag) return "Yesterday";
  return dateTag;
}

export default function MessagesLoader({
  messages = [],
  handleScrollingMessages,
  loading = false,
}) {
  const { user } = useAuth();
  const mainRef = useRef(null);
  let prevDateTag = null;

  useEffect(() => {
    mainRef.current.scrollTop = mainRef.current.scrollHeight;
  }, [messages]);

  return (
    <main
      onScroll={handleScrollingMessages}
      ref={mainRef}
      id={styles["messages-display"]}
    >
      {loading && <h2>Loading...</h2>}
      {messages.map((msg) => {
        const dateTag = getMessageDateTag(msg.date);
        const isDifferentDateTag = dateTag != prevDateTag;
        prevDateTag = dateTag;

        return (
          <Fragment key={uniqueId()}>
            {isDifferentDateTag && (
              <span
                className={`${styles["date-span"]} ${styles.item}`}
                key={dateTag}
              >
                {dateTag}
              </span>
            )}
            <div
              className={`${styles.message} ${styles.item}`}
              aria-label={`${
                msg.sender == user.username ? "Your" : "Partner's"
              } message`}
            >
              {msg.message}
              <span className={styles["time-span"]}>
                {format(new Date(msg.date), "HH:mm")}
              </span>
            </div>
          </Fragment>
        );
      })}
    </main>
  );
}

MessagesLoader.propTypes = {
  messages: PropTypes.array.isRequired,
  handleScrollingMessages: PropTypes.func,
  loading: PropTypes.bool.isRequired,
};
