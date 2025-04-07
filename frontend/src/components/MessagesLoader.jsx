import PropTypes from "prop-types";
import { format } from "date-fns";
import { uniqueId } from "lodash";
import { useAuth } from "../hooks/useAuth";

export default function MessagesLoader({ messages = [] }) {
  const { user } = useAuth();

  return (
    <main>
      {messages.map((msg) => {
        return (
          <div
            key={uniqueId()}
            aria-label={`${
              msg.sender == user.username ? "Your" : "Partner's"
            } message`}
          >
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
