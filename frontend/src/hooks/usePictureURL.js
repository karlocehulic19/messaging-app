import { useCallback, useEffect, useRef, useState } from "react";

function usePictureURL(pictureFile) {
  const [pictureURL, setPictureURL] = useState(null);
  const clear = useRef(() => null);

  const reset = useCallback(() => {
    clear.current();
    clear.current = () => null;
    setPictureURL(null);
  }, []);

  useEffect(() => {
    if (pictureFile) {
      const newPictureURL = URL.createObjectURL(pictureFile);

      setPictureURL(newPictureURL);
      clear.current = () => {
        URL.revokeObjectURL(newPictureURL);
      };

      return clear.current;
    }
  }, [pictureFile]);

  return { pictureURL, reset };
}

export default usePictureURL;
