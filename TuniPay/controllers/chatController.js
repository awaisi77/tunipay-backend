const Chat = require("../models/chat");
const User = require("../models/users");
const asyncHandler = require("express-async-handler");

const saveChat = asyncHandler(async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(400).json({ error: "Sender not found." });
    }
    const senderRole = sender.role;

    let receiverRole = "admin";
    if (receiverId) {
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return res.status(400).json({ error: "Receiver not found." });
      }
      receiverRole = receiver.role;
    }

    let uId;

    if (receiverRole === "user") {
      uId = receiverId;
    }
    if (senderRole === "user") {
      uId = senderId;
    }

    if (
      (senderRole === "user" && receiverRole !== "admin") ||
      (senderRole === "admin" && receiverRole !== "user")
    ) {
      return res
        .status(400)
        .json({ error: "Sender and receiver roles must be complementary." });
    }

    const participants = [{ id: senderId, role: senderRole }];
    if (receiverId) {
      participants.push({ id: receiverId, role: receiverRole });
    } else {
      participants.push({ id: null, role: "admin" });
    }

    let chat = await Chat.findOne({
      participants: {
        $elemMatch: { id: uId },
      },
    });

    if (!chat) {
      chat = new Chat({
        participants,
        messages: [{ sender: senderId, role: senderRole, content: message }],
      });
    } else {
      chat.messages.push({
        sender: senderId,
        role: senderRole,
        content: message,
      });
    }

    chat.timestamp = new Date();

    await chat.save();

    res.status(200).json({ message: "Message saved successfully." });
  } catch (error) {
    console.log("ERRRRRRRRRRRR-->>>", error);
    res.status(500).json({ error: "Error saving message." });
  }
});

const getChat = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Chat.find({
      $or: [{ "participants.id": userId }],
    })
      .sort({ timestamp: 1 })
      .select("messages");

    const allMessages = await Promise.all(
      messages.map(async (message) => {
        const chatMessages = message.messages.map((msg) => ({
          sender: msg.sender,
          content: msg.content,
          role: msg.role,
          timestamp: msg.timestamp,
        }));

        const senders = await Promise.all(
          chatMessages.map(async (msg) => {
            const senderName = await User.findById(msg.sender).select(
              "username"
            );
            return {
              id: msg.sender,
              name: senderName.username,
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp,
            };
          })
        );

        return senders;
      })
    );

    res.status(200).json(allMessages);
  } catch (error) {
    console.error("Error fetching chat history:", error);

    res.status(500).json({ error: "Error fetching chat history." });
  }
});

const allChats = asyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find().select(
      "messages.sender messages.content messages.timestamp messages.role"
    );

    const allChats = [];

    for (const chat of chats) {
      chat.messages.sort((a, b) => b.timestamp - a.timestamp);

      const latestMessage = chat.messages[0];

      const chatData = {
        latestMessage,
      };

      allChats.push(chatData);
    }

    res.status(200).json(allChats);
  } catch (error) {
    res.status(500).json({ error: "Error fetching all chats." });
  }
});

module.exports = {
  saveChat,
  getChat,
  allChats,
};
