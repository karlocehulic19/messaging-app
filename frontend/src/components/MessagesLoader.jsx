import PropTypes from "prop-types";
import { format } from "date-fns";
import { uniqueId } from "lodash";
import { useAuth } from "../hooks/useAuth";
import { Fragment } from "react";

const MS_IN_DAY = 1000 * 60 * 60 * 24;

function getMessageDateTag(date) {
  const dateTag = format(new Date(date), "MMM do");
  if (format(new Date(), "MMM do") === dateTag) return "Today";
  if (format(new Date() - MS_IN_DAY, "MMM do") === dateTag) return "Yesterday";
  return dateTag;
}

export default function MessagesLoader({ messages = [] }) {
  const { user } = useAuth();
  let prevDateTag = null;

  return (
    <main>
      {messages.map((msg) => {
        const dateTag = getMessageDateTag(msg.date);
        const isDifferentDateTag = dateTag != prevDateTag;
        prevDateTag = dateTag;

        return (
          <Fragment key={uniqueId()}>
            {isDifferentDateTag && <span key={dateTag}>{dateTag}</span>}
            <div
              aria-label={`${
                msg.sender == user.username ? "Your" : "Partner's"
              } message`}
            >
              {msg.message}
              <span>{format(new Date(msg.date), "HH:mm")}</span>
            </div>
          </Fragment>
        );
      })}
    </main>
  );
}

MessagesLoader.propTypes = {
  messages: PropTypes.array,
};
