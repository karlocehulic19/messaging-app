import PropTypes from "prop-types";
import { useProfilePicture } from "../hooks/useProfilePicture";

export default function MessagingInterface({ receiverUsername }) {
  const profilePictureSrc = useProfilePicture(receiverUsername);

  return (
    <>
      <h1>{receiverUsername}</h1>
      <img
        src={profilePictureSrc}
        alt={`${receiverUsername}'s profile picture`}
      />
      <input type="text" aria-label="Message input" />
      <button aria-label="Send button"></button>
    </>
  );
}

MessagingInterface.propTypes = {
  receiverUsername: PropTypes.string.isRequired,
};
