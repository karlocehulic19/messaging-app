import { useDropzone } from "react-dropzone";
import styles from "./styles/ProfilePictureSelector.module.css";
import { useEffect, useState } from "react";

function ProfilePictureSelector() {
  const [pictureUrl, setPictureUrl] = useState(null);
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      maxFiles: 1,
      accept: {
        "image/jpeg": [],
        "image/png": [],
      },
    });

  const fileRejected = !!fileRejections.length;

  useEffect(() => {
    console.log(acceptedFiles);
    // setPictureUrl(URL.createObjectURL(acceptedFiles[0]));
    // return () => {
    //   URL.revokeObjectURL(pictureUrl);
    // };
  }, [acceptedFiles]);

  return (
    <div className="profile-picture-container">
      <div aria-label="Profile picture demonstration">
        <label htmlFor="profile-picture">Profile picture</label>
        <img src={acceptedFiles[0]?.path} alt="Current Profile picture" />
      </div>
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
