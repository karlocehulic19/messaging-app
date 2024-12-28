import { useCallback, useEffect, useState, useRef } from "react";

function useValidator(validator) {
  const [formData, setFormData] = useState({});
  const firstRender = useRef(true);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!firstRender.current) {
      (async () => {
        setValidationErrors(await validator.validate(formData));
      })();
    }
  }, [formData, validator]);

  const changeFormData = useCallback(
    (field, value) => {
      if (validator.isAllowed(field)) {
        setFormData((prevData) => ({ ...prevData, [field]: value }));
      }

      firstRender.current = false;
    },
    [validator]
  );

  const syncValidate = async () => {
    const validationErrors = await validator.validate(formData);
    setValidationErrors(validationErrors);
    return !Object.keys(validationErrors).length;
  };
  return {
    formData,
    validationErrors,
    changeFormData,
    syncValidate,
  };
}

export default useValidator;
