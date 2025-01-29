import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import customFetch from "../utils/customFetch";

export default function SearchCard({ username, photoId = null }) {
  const [imgSrc, setImgSrc] = useState();

  useEffect(() => {
    customFetch(`/profile-picture/${photoId}`)
      .then((res) => res.blob())
      .then((img) => {
        const profPic = URL.createObjectURL(img);
        setImgSrc(profPic);
      });
  }, [photoId]);

  return (
    <div aria-label={`${username} user`}>
      <img src={imgSrc} alt={`${username} profile picture`} />
      <span>{username}</span>
    </div>
  );
}

SearchCard.propTypes = {
  username: PropTypes.string.isRequired,
  photoId: PropTypes.string,
};
