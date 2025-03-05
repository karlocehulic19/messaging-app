import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import customFetch from "../utils/customFetch";
import { useAuth } from "../hooks/useAuth";

export default function Settings() {
  const { user, token } = useAuth();
  const [updatedData, setUpdatedData] = useState({
    username: user?.username || "Loading...",
    email: user?.email || "Loading...",
  });

  useEffect(() => {
    if (user) {
      setUpdatedData({
        username: user.username,
        email: user.email,
      });
    }
  }, [user]);

  function handleUpdate() {
    customFetch("/users/update", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        senderUsername: user.username,
        newUsername:
          updatedData.username != user.username
            ? updatedData.username
            : undefined,
        newEmail:
          updatedData.email != user.email ? updatedData.email : undefined,
      },
    });
  }

  function handleInputChange(e) {
    setUpdatedData((prevData) => ({
      ...prevData,
      [e.target.id]: e.target.value,
    }));
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
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
