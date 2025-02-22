import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import customFetch from "../utils/customFetch";
import defaultProfilePicture from "../assets/default-profile-picture.jpeg";
import { useNavigate } from "react-router-dom";
import apiErrorLogger from "../utils/apiErrorLogger";

export default function SearchCard({ username, searchBarRef }) {
  const [imgSrc, setImgSrc] = useState(defaultProfilePicture);
  const navigate = useNavigate();

  useEffect(() => {
    customFetch(`/users/profile-picture/${username}`)
      .then((res) => {
        if (res.status != 200) throw new Error("No profile picture found");
        return res.blob();
      })
      .then((img) => {
        const profPic = URL.createObjectURL(img);
        setImgSrc(profPic);
      })
      .catch(apiErrorLogger);
  }, [username]);

  function handleClick(e) {
    e.preventDefault();
    navigate(`/${username}`);
    searchBarRef.current.blur();
  }

  return (
    <div
      tabIndex={-1}
      onMouseDown={handleClick}
      aria-label={`${username} user`}
    >
      <img src={imgSrc} alt={`${username} profile picture`} />
      <span>{username}</span>
    </div>
  );
}

SearchCard.propTypes = {
  username: PropTypes.string.isRequired,
  photoId: PropTypes.string,
  searchBarRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};
