const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();

module.exports.getUserByUsername = async (username) => {
  return await client.user.findFirst({
    where: {
      username,
    },
  });
};

module.exports.getUserByEmail = async (email) => {
  return await client.user.findFirst({ where: { email } });
};

module.exports.createUser = async (user) => {
  await client.user.create({
    data: {
      ...user,
    },
  });
};
