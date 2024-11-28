const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();

module.exports.readUserByUsername = async (username) => {
  return await client.user.findFirst({
    where: {
      username: username,
    },
  });
};
