import { useEffect, useState } from "react";
import customFetch from "../utils/customFetch";
import apiErrorLogger from "../utils/apiErrorLogger";
import defaultProfilePicture from "../assets/default-profile-picture.jpeg";

export const useProfilePicture = (username) => {
  const [profilePictureSrc, setProfilePictureSrc] = useState(
    defaultProfilePicture
  );

  useEffect(() => {
    customFetch(`/users/profile-picture/${username}`)
      .then((res) => {
        if (res.status != 200) throw new Error("No profile picture found");
        return res.blob();
      })
      .then((img) => {
        const profPic = URL.createObjectURL(img);
        setProfilePictureSrc(profPic);
      })
      .catch(apiErrorLogger);
  }, [username]);

  return profilePictureSrc;
};
