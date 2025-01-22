const prisma = require("../prisma");

beforeEach(async () => {
  const deleteUsers = prisma.user.deleteMany();

  await prisma.$transaction([deleteUsers]);

  await prisma.$disconnect();
});
