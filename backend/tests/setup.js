/* eslint-disable no-undef */
const prisma = require("../prisma");

afterEach(async () => {
  const deleteUsers = prisma.user.deleteMany();

  await prisma.$transaction([deleteUsers]);

  await prisma.$disconnect();
});
