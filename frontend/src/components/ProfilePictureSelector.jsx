import { useDropzone } from "react-dropzone";
import styles from "./styles/ProfilePictureSelector.module.css";
import { useCallback, useEffect, useState } from "react";
import convertSquare from "../utils/convertSquare";
import PropTypes from "prop-types";

function ProfilePictureSelector({
  imageFormatter = convertSquare,
  onImageSelect,
}) {
  const [formattedPicture, setFormattedPicture] = useState(null);
  const [formatterError, setFormatterError] = useState(false);
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      maxFiles: 1,
      accept: {
        "image/jpeg": [],
        "image/png": [],
      },
    });

  const pictureFile = acceptedFiles[0];
  const fileRejected = !!fileRejections.length;

  const removePicture = useCallback(() => {
    onImageSelect(null);
    setFormattedPicture(null);
  }, [onImageSelect]);

  useEffect(() => {
    setFormatterError(false);

    if (pictureFile) {
      const convert = async () => {
        try {
          const base64 = await imageFormatter(
            await pictureFile.arrayBuffer(),
            pictureFile.type
          );
          setFormattedPicture(base64);
          onImageSelect(base64);
        } catch (error) {
          console.log(error);
          removePicture();
          setFormatterError(true);
        }
      };

      convert();
    }
  }, [pictureFile, imageFormatter, onImageSelect, removePicture]);

  return (
    <div
      data-testid="profile-picture-container"
      id={
        formattedPicture
          ? styles["picture-container-demo"]
          : styles["picture-container"]
      }
    >
      {formattedPicture && (
        <div
          id={styles["picture-icon-container"]}
          aria-label="Profile picture demonstration"
        >
          <label htmlFor="profile-picture">Profile picture</label>
          <img
            id={styles["image-demo"]}
            src={formattedPicture}
            alt="Current Profile picture"
          />
          <button
            type="button"
            aria-label="Remove Picture"
            onClick={removePicture}
          >
            Remove Picture
          </button>
        </div>
      )}

      <div id={styles["picture-dropbox-container"]}>
        {fileRejected && (
          <p>Please select image that is in PNG or JPEG format</p>
        )}

        {formatterError && <p>Please select another image.</p>}
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
  onImageSelect: PropTypes.func.isRequired,
};

export default ProfilePictureSelector;
