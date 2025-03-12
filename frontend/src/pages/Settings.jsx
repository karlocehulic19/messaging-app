import { useCallback, useEffect, useRef, useState } from "react";
import customFetch from "../utils/customFetch";
import { useAuth } from "../hooks/useAuth";
import ProfilePictureSelector from "../components/ProfilePictureSelector";
import apiErrorLogger from "../utils/apiErrorLogger";
import ErrorPopup from "../components/ErrorPopup";
import UpdateFormInputs from "../components/UpdateFormInputs";
import BackButton from "../components/BackButton";
import styles from "./styles/Settings.module.css";

export default function Settings() {
  const { user, token, logout, validate } = useAuth();
  const [updatedData, setUpdatedData] = useState({
    username: user?.username || "Loading...",
    email: user?.email || "Loading...",
  });
  const [prevPicture, setPrevPicture] = useState(null);
  const [updateInfo, setUpdateInfo] = useState("loading");
  const errorPopup = useRef();

  const isUpdated =
    updateInfo != "loading" &&
    (updatedData.email != user?.email ||
      updatedData.username != user?.username ||
      updatedData.newPicBase64URI);

  useEffect(() => {
    if (user) {
      setUpdatedData({
        username: user.username,
        email: user.email,
      });
      customFetch(`/users/profile-picture/${user.username}`)
        .then((res) => {
          if (res.status != 200) throw new Error("No profile picture found");
          return res.blob();
        })
        .then((img) => {
          const picUrl = URL.createObjectURL(img);
          setPrevPicture(picUrl);
          setUpdateInfo("editing");
        })
        .catch(apiErrorLogger);
    }
  }, [user]);

  function handleUpdate() {
    setUpdateInfo("loading");
    customFetch("/users/update", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        senderUsername: user.username,
        ...(updatedData.username != user.username && {
          newUsername: updatedData.username,
        }),
        ...(updatedData.email != user.email && { newEmail: updatedData.email }),
        ...(updatedData.newPicBase64URI && {
          newPictureBase64: updatedData.newPicBase64URI,
        }),
      }),
    })
      .then(() => validate())
      .catch(async (error) => {
        const resJSON = await apiErrorLogger(error);
        errorPopup.current.toggle(
          resJSON?.error.validation
            ? resJSON.error.validation.map(
                (validationError) => validationError.message
              )
            : null
        );
      })
      .finally(() => setUpdateInfo("editing"));
  }

  function handleInputChange(e) {
    setUpdatedData((prevData) => ({
      ...prevData,
      [e.target.id]: e.target.value,
    }));
  }

  const handleProfPicSelect = useCallback((newPicBase64URI) => {
    setUpdatedData((prevData) => ({ ...prevData, newPicBase64URI }));
  }, []);

  return (
    <>
      <BackButton />
      <div id={styles.settings}>
        <ErrorPopup ref={errorPopup} />
        <ProfilePictureSelector
          onImageSelect={handleProfPicSelect}
          defaultFormattedPicture={prevPicture}
          direction="column"
          className={styles["image-update-container"]}
        />
        <div className={styles["info-container"]}>
          <div className={styles["data-container"]}>
            <label htmlFor="firstName">First Name:</label>
            <span className={styles["user-data"]}>
              {user?.firstName || "Loading..."}
            </span>
            <label htmlFor="lastName">Last Name:</label>

            <span className={styles["user-data"]}>
              {user?.lastName || "Loading..."}
            </span>
          </div>
          <UpdateFormInputs
            infoState={updateInfo}
            username={updatedData.username}
            email={updatedData.email}
            handleInputChange={handleInputChange}
          />
        </div>
        <div className={styles["button-container"]}>
          <button
            className={styles["settings-button"]}
            id={styles["update-button"]}
            disabled={!isUpdated}
            onClick={handleUpdate}
          >
            {updateInfo == "loading" ? "Loading..." : "Update"}
          </button>
          <button
            className={styles["settings-button"]}
            id={styles["logout-button"]}
            onClick={logout}
          >
            Log Out
          </button>
        </div>
      </div>
    </>
  );
}
