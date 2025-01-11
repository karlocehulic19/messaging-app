import { useDropzone } from "react-dropzone";
import styles from "./styles/ProfilePictureSelector.module.css";
import { useEffect, useState } from "react";
import convertSquare from "../utils/convertSquare";
import PropTypes from "prop-types";

function ProfilePictureSelector({ imageFormatter = convertSquare }) {
  const [formattedPicture, setFormattedPicture] = useState(null);
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      maxFiles: 1,
      accept: {
        "image/jpeg": [],
        "image/png": [],
      },
    });

  const pictureFile = acceptedFiles[0];
  useEffect(() => {
    if (pictureFile) {
      const convert = async () => {
        try {
          const base64 = await imageFormatter(pictureFile);
          setFormattedPicture(base64);
        } catch (error) {
          console.log(error);
          setFormattedPicture(null);
        }
      };

      convert();
    }
  }, [pictureFile, imageFormatter]);

  const fileRejected = !!fileRejections.length;

  return (
    <div
      data-testid="profile-picture-container"
      className="profile-picture-container"
      id={
        formattedPicture
          ? styles["picture-container-demo"]
          : styles["picture-container"]
      }
    >
      {formattedPicture && (
        <div aria-label="Profile picture demonstration">
          <label htmlFor="profile-picture">Profile picture</label>
          <img src={formattedPicture} alt="Current Profile picture" />
          <button onClick={() => setFormattedPicture(null)}>
            Remove Picture
          </button>
        </div>
      )}

      <div className="picture-dropbox-container">
        {fileRejected && (
          <p>Please select image that is in PNG or JPEG format</p>
        )}
        <div
          {...getRootProps({
            className: "dropbox",
            id: styles["picture-dropbox"],
            ["aria-label"]: "Profile picture dropbox",
          })}
        >
          <input
            {...getInputProps({
              htmlFor: "profile-picture",
              id: "profile-picture",
              ["data-testid"]: "picture-input",
            })}
          />
          <p>Drop your profile picture here!</p>
        </div>
      </div>
    </div>
  );
}

ProfilePictureSelector.propTypes = {
  imageFormatter: PropTypes.func,
};

export default ProfilePictureSelector;
