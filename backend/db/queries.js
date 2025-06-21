const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();
const {
  MESSAGES_PER_REQUEST,
  SEARCHED_USER_NUMBER,
} = require("../utils/constants");

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

module.exports.getUsernamesBySearch = async (search) => {
  return (
    await client.user.findMany({
      take: SEARCHED_USER_NUMBER,
      where: {
        username: {
          startsWith: search,
          mode: "insensitive",
        },
      },
    })
  ).map((user) => ({ username: user.username }));
};

module.exports.getMostActiveSendersUsernames = async () => {
  const userGroup = await client.message.groupBy({
    by: ["sender"],
    _count: {
      sender: true,
    },
    orderBy: {
      _count: {
        sender: "desc",
      },
    },
    take: SEARCHED_USER_NUMBER,
  });

  return userGroup.map((msgData) => ({ username: msgData.sender }));
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

module.exports.sendMessage = async (sender, receiver, message, date) => {
  return await client.message.create({
    data: {
      sender,
      receiver,
      message,
      date,
    },
  });
};

module.exports.getNewMessages = async (sender, receiver) => {
  const foundNewMessages = await client.message.findMany({
    where: {
      sender,
      receiver,
      opened: false,
    },
    orderBy: {
      date: "asc",
    },
  });

  await client.message.updateMany({
    where: {
      sender,
      receiver,
      opened: false,
    },
    data: {
      opened: true,
    },
  });

  return foundNewMessages;
};

module.exports.getOldMessages = async (sender, receiver, position = 0) => {
  const res = await client.message.findMany({
    skip: position,
    take: -MESSAGES_PER_REQUEST,
    where: {
      OR: [
        { sender, receiver },
        { sender: receiver, receiver: sender, opened: true },
      ],
    },
    orderBy: {
      date: "asc",
    },
  });
  return res;
};
