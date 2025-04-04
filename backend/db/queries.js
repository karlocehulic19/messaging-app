const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();
const { MESSAGES_PER_REQUEST } = require("../utils/constants");

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

module.exports.getUsersByUsername = async (search) => {
  return await client.user.findMany({
    take: 5,
    where: {
      username: {
        startsWith: search,
      },
    },
  });
};

module.exports.getUserById = async (id) => {
  return await client.user.findFirst({ where: { id } });
};

module.exports.updateUser = async (originalUsername, updatedValues) => {
  return await client.user.update({
    where: { username: originalUsername },
    data: updatedValues,
  });
};

module.exports.sendMessage = async (sender, receiver, message) => {
  return await client.message.create({
    data: {
      sender,
      receiver,
      message,
      date: new Date(),
    },
  });
};

module.exports.getNewMessages = async (sender, receiver) => {
  return await client.message.updateManyAndReturn({
    where: {
      sender,
      receiver,
      opened: false,
    },
    data: {
      opened: true,
    },
  });
};

module.exports.getOldMessages = async (sender, receiver, page = 1) => {
  const res = await client.message.findMany({
    skip: (page - 1) * MESSAGES_PER_REQUEST,
    take: MESSAGES_PER_REQUEST,
    where: {
      OR: [
        { sender, receiver },
        { sender: receiver, receiver: sender, opened: true },
      ],
    },
  });
  return res;
};
