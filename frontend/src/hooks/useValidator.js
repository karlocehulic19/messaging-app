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

  const syncValidate = async () =>
    !Object.keys(await validator.validate(formData)).length;

  return {
    formData,
    validationErrors,
    changeFormData,
    syncValidate,
  };
}

export default useValidator;
