import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import customFetch from "../utils/customFetch";
import { useAuth } from "../hooks/useAuth";
import ProfilePictureSelector from "../components/ProfilePictureSelector";
import apiErrorLogger from "../utils/apiErrorLogger";

export default function Settings() {
  const { user, token, logout } = useAuth();
  const [updatedData, setUpdatedData] = useState({
    username: user?.username || "Loading...",
    email: user?.email || "Loading...",
  });
  const [prevPicture, setPrevPicture] = useState(null);

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
        })
        .catch(apiErrorLogger);
    }
  }, [user]);

  function handleUpdate() {
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
    });
  }

  function handleInputChange(e) {
    setUpdatedData((prevData) => ({
      ...prevData,
      [e.target.id]: e.target.value,
    }));
  }

  function handleProfPicSelect(newPicBase64URI) {
    setUpdatedData((prevData) => ({ ...prevData, newPicBase64URI }));
  }

  return (
    <div>
      <Link to={"/"}></Link>
      <span>{user?.firstName || "Loading..."}</span>
      <span>{user?.lastName || "Loading..."}</span>
      <input
        value={updatedData.username}
        onChange={handleInputChange}
        type="text"
        name="username"
        id="username"
        aria-label="Username input"
      />
      <input
        value={updatedData.email}
        onChange={handleInputChange}
        type="email"
        name="email"
        id="email"
        aria-label="Email input"
      />
      <ProfilePictureSelector
        onImageSelect={handleProfPicSelect}
        defaultFormattedPicture={prevPicture}
      />
      <button onClick={handleUpdate}>Update</button>
      <button onClick={logout}>Log Out</button>
    </div>
  );
}
