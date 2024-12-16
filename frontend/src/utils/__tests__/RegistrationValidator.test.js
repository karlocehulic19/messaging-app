import { describe, expect, it } from "vitest";
import RegistrationValidator from "../RegistrationValidator";

const setup = () => {
  const validData = {
    username: "test",
    firstName: "Karo",
    lastName: "Čehulić",
    email: "karlocehlic@gmail.com",
    password: "Som3PW1@",
    passwordConf: "Som3PW1@",
  };

  return { validData };
};

test("returns message on non ascii username", async () => {
  const { validData } = setup();

  expect(
    await RegistrationValidator.validate({ ...validData, username: "Čoki" })
  ).toEqual({
    username: "Invalid characters are provided",
  });
});

test("returns message on non email", async () => {
  const { validData } = setup();

  expect(
    await RegistrationValidator.validate({
      ...validData,
      email: "invlid@email",
    })
  ).toEqual({
    email: "Value provided must be an valid email address",
  });
});

test("returns message on not long enough password", async () => {
  const { validData } = setup();

  expect(
    await RegistrationValidator.validate({
      ...validData,
      password: "notlong",
      passwordConf: "notlong",
    })
  ).toEqual({
    password: "Password must contain at least 8 characters",
  });
});

test("returns message on password not containing symbol", async () => {
  const { validData } = setup();

  expect(
    await RegistrationValidator.validate({
      ...validData,
      password: "N0tlongenoght",
      passwordConf: "N0tlongenoght",
    })
  ).toEqual({
    password: "Password must contain at least one symbol",
  });
});

test("returns message on different password and password confirmation", async () => {
  const { validData } = setup();

  expect(
    await RegistrationValidator.validate({
      ...validData,
      passwordConf: "Something very different",
    })
  ).toEqual({
    passwordConf: "Password confirmation must be same as password",
  });
});
