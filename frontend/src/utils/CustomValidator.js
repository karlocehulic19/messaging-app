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

export class ValidatorBuilder {
  constructor() {
    this.validator = new CustomValidator();
  }

  field(field) {
    if (!field || typeof field !== "string")
      throw new Error("Field argument must be a non empty string");
    this.currField = field;

    return this;
  }

  addRule(rule, message) {
    if (!this.currField) {
      throw new Error("Field name must be specified before adding a rule");
    }

    this.validator.addValidation(this.currField, rule, message);
    return this;
  }

  build() {
    return this.validator;
  }
}
