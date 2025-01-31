import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import customFetch from "../utils/customFetch";
import defaultProfilePicture from "../assets/default-profile-picture.jpeg";
import { useNavigate } from "react-router-dom";

export default function SearchCard({ username, photoId = null }) {
  const [imgSrc, setImgSrc] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    customFetch(`/profile-picture/${photoId}`)
      .then((res) => res.blob())
      .then((img) => {
        const profPic = URL.createObjectURL(img);
        setImgSrc(profPic);
      })
      .catch(() => {
        setImgSrc(defaultProfilePicture);
      });
  }, [photoId]);

  return (
    <div
      onClick={() => navigate(`/${username}`)}
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
};
