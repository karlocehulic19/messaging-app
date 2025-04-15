import PropTypes from "prop-types";
import { format } from "date-fns";
import { uniqueId } from "lodash";
import { useAuth } from "../hooks/useAuth";
import { Fragment } from "react";

export default function MessagesLoader({ messages = [] }) {
  const { user } = useAuth();
  let prevDate = null;

  return (
    <main>
      {messages.map((msg) => {
        const date = format(new Date(msg.date), "MMM do");
        const isDifferentDate = date != prevDate;
        prevDate = date;

        return (
          <Fragment key={uniqueId()}>
            {isDifferentDate && <span key={date}>{date}</span>}
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
