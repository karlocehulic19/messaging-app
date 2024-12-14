class CustomValidator {
  constructor() {
    this.validationChain = {};
  }

  isAllowed(field) {
    return field in this.validationChain;
  }

  addValidation(field, callback, message) {
    if (!(field in this.validationChain)) {
      this.validationChain[field] = [];
    }
    this.validationChain[field].push([callback, message]);

    return null;
  }

  async #validateField(field, value) {
    for (const [callback, message] of this.validationChain[field]) {
      if (!(await callback(value))) throw { field, message };
    }

    return;
  }

  async validate(formData) {
    const errorMessages = {};
    const promises = [];

    for (const field of Object.keys(this.validationChain)) {
      promises.push(this.#validateField(field, formData[field]));
    }

    await Promise.allSettled(promises).then((result) => {
      result
        .filter(({ status }) => status === "rejected")
        .forEach(({ reason }) => {
          errorMessages[reason.field] = reason.message;
        });
    });

    return errorMessages;
  }
}

export default CustomValidator;
