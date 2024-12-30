import { useDropzone } from "react-dropzone";
import styles from "./styles/ProfilePictureSelector.module.css";
import usePictureURL from "../hooks/usePictureURL";

function ProfilePictureSelector() {
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      maxFiles: 1,
      accept: {
        "image/jpeg": [],
        "image/png": [],
      },
    });

  const pictureURL = usePictureURL(acceptedFiles[0]);

  const fileRejected = !!fileRejections.length;

  return (
    <div
      data-testid="profile-picture-container"
      className="profile-picture-container"
      id={
        pictureURL
          ? styles["picture-container-demo"]
          : styles["picture-container"]
      }
    >
      {pictureURL && (
        <div aria-label="Profile picture demonstration">
          <label htmlFor="profile-picture">Profile picture</label>
          <img src={pictureURL} alt="Current Profile picture" />
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

export default ProfilePictureSelector;
