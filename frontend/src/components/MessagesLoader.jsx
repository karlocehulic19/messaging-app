import PropTypes from "prop-types";
import { format } from "date-fns";
import { uniqueId } from "lodash";

export default function MessagesLoader({ messages = [] }) {
  return (
    <main>
      {messages.map((msg) => {
        return (
          <div key={uniqueId()} aria-label="message">
            {msg.message}
            <span>{format(new Date(msg.date), "HH:mm")}</span>
          </div>
        );
      })}
    </main>
  );
}

MessagesLoader.propTypes = {
  messages: PropTypes.array,
};
