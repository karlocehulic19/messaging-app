import Navbar from "../components/NavBar";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MessagingInterface from "../components/MessagingInterface";
import customFetch from "../utils/customFetch";

export default function Main() {
  const params = useParams();
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    if (!params.receiverUsername) return setIsSelected(false);
    customFetch(`/users?exists=${params.receiverUsername}`)
      .then(() => setIsSelected(true))
      .catch(() => setIsSelected(false));
  }, [params]);

  return (
    <>
      <Navbar />
      {isSelected ? (
        <MessagingInterface receiverUsername={params.receiverUsername} />
      ) : (
        <h1>Select user to message in the search bar</h1>
      )}
    </>
  );
}
