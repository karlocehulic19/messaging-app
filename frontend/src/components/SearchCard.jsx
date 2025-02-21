import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import customFetch from "../utils/customFetch";
import defaultProfilePicture from "../assets/default-profile-picture.jpeg";
import { useNavigate } from "react-router-dom";

export default function SearchCard({ username }) {
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
      .catch(async (error) => {
        if (error.response) {
          const errJSON = await error.response.json();
          if (errJSON) console.log("Request JSON: ", errJSON);
        }
        console.log(error);
      });
  }, [username]);

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
