const prisma = require("../prisma");

beforeEach(async () => {
  const deleteUsers = prisma.user.deleteMany();
  const deleteMessages = prisma.message.deleteMany();

  await prisma.$transaction([deleteUsers, deleteMessages]);

  await prisma.$disconnect();
});
