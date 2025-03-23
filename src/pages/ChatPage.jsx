import React, { useEffect, useState } from "react";
import API from "../api/api";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const ChatPage = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showUsersList, setShowUsersList] = useState(true);

  useEffect(() => {
    fetchLoggedInUser();
    fetchChats();
    fetchUsers();
    socket.on("message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
  }, []);
  const fetchMessages = async () => {
    try {
      const response = await API.get(`/messages/${selectedChat._id}`);
      setMessages(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      setShowUsersList(false);
      socket.emit("joinChat", selectedChat._id);
      fetchMessages();
    }
  }, [selectedChat]);

  const fetchLoggedInUser = async () => {
    try {
      const { data } = await API.get("/users/profile");
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchChats = async () => {
    try {
      const { data } = await API.get("/chats");
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/users");
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleNewChat = async (userId) => {
    try {
      const { data } = await API.post("/chats", { userId });
      //   setChats((prevChats) => [...prevChats, data]);
      fetchChats();
      setSelectedChat(data);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      const response = await API.post("/messages", {
        content: message,
        sender: user._id,
        chatId: selectedChat._id,
      });

      //   setMessages((prevMessages) => [...prevMessages, response.data]);
      socket.emit("sendMessage", response.data);
      setMessage("");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleMessage = (newMessage) => {
      console.log(newMessage);
      if (newMessage.chat?._id === selectedChat?._id) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    };

    socket.on("messageReceived", handleMessage);

    return () => {
      socket.off("messageReceived", handleMessage);
    };
  }, [selectedChat]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex h-screen">
        {/* Left Panel - Chat List */}
        <div className="w-1/3  p-4 overflow-auto">
          <h2 className="text-lg font-bold mb-4">Chats</h2>
          {chats.length === 0 ? (
            <p>No chats available. Start a new chat!</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                className="p-2 cursor-pointer flex items-center rounded-lg hover:bg-gray-300 transition duration-300"
                onClick={() => setSelectedChat(chat)}
              >
                <img
                  src={
                    chat.users.find((u) => u._id !== user?._id)?.profilePic ||
                    "default-profile.png"
                  }
                  alt={chat.users.find((u) => u._id !== user?._id)?.name}
                  className="w-10 h-10 rounded-full mr-2"
                />
                <span className="font-medium">
                  {chat.users.find((u) => u._id !== user?._id)?.name}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Right Panel - Chat or New Chat */}
        <div className="w-2/3  bg-gray-200">
          {selectedChat && !showUsersList ? (
            <div className="h-full flex flex-col justify-between">
              <div className="bg-white p-4 flex items-center">
                <img
                  src={
                    selectedChat.users.find((u) => u._id !== user?._id)
                      ?.profilePic || "default-profile.png"
                  }
                  alt={
                    selectedChat.users.find((u) => u._id !== user?._id)?.name
                  }
                  className="w-10 h-10 rounded-full mr-2"
                />
                <h2 className="font-semibold">
                  {selectedChat.users.find((u) => u._id !== user?._id)?.name}
                </h2>
              </div>
              <div className="h-80 overflow-auto border p-4 mb-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={
                      msg.sender._id === user._id
                        ? "text-right mb-2"
                        : "text-left mb-2"
                    }
                  >
                    <p
                      className={`p-2 inline-block rounded-lg ${
                        msg.sender._id === user._id
                          ? "bg-green-200"
                          : "bg-white"
                      }`}
                    >
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
              <div
                className="flex p-4 "
                style={{ width: "-webkit-fill-available" }}
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="border p-2 w-full"
                />
                <button
                  onClick={handleSendMessage}
                  className="mt-2 p-2 bg-blue-500 text-white"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-bold mb-4">Start a New Chat</h2>
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 w-full mb-4"
              />
              {filteredUsers.map((u) => (
                <button
                  key={u._id}
                  onClick={() => handleNewChat(u._id)}
                  className="block w-full p-2 bg-blue-500 text-white mb-2 rounded"
                >
                  Chat with {u.name}
                </button>
              ))}
            </div>
          )}
          {/* {selectedChat && (
            <button
              className="bg-blue-500 text-white"
              onClick={() => {
                setShowUsersList(true);
              }}
            >
              +
            </button>
          )} */}
        </div>
      </div>
    </>
  );
};

export default ChatPage;
