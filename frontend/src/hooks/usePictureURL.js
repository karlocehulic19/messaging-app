import { useEffect, useState } from "react";

function usePictureURL(pictureFile) {
  const [pictureURL, setPictureUrl] = useState(null);

  useEffect(() => {
    if (pictureFile) {
      const newPicURL = URL.createObjectURL(pictureFile);
      setPictureUrl(newPicURL);

      return () => {
        URL.revokeObjectURL(newPicURL);
      };
    } else {
      setPictureUrl(null);
    }
  }, [pictureFile]);

  return pictureURL;
}

export default usePictureURL;
