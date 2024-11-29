/* eslint-disable no-undef */
const prisma = require("../prisma");

afterAll(async () => {
  const deleteUsers = prisma.user.deleteMany();

  await prisma.$transaction([deleteUsers]);

  await prisma.$disconnect();
});
