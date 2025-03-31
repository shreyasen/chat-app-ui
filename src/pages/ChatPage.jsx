import React, { useEffect, useState } from "react";
import API from "../api/api";
import { io } from "socket.io-client";
import back from "../assets/back-arrow.svg";
import avatar from "../assets/avatar.png";
import newMessage from "../assets/new-message.svg";
import SideBar from "../components/SideBar";
import UserList from "../components/UserList";
import { useDispatch, useSelector } from "react-redux";
import Profile from "../components/Profile";
import { performAction } from "../reducers/userActionSlice";
import Settings from "../components/Settings";

const socket = io("http://localhost:5000");

const ChatPage = () => {
  const dispatch = useDispatch();
  const userAction = useSelector((state) => state.userAction.leftPanel);
  const [userProfile, setUserProfile] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchLoggedInUser();
    fetchChats();
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
      socket.emit("joinChat", selectedChat._id);
      fetchMessages();
    }
  }, [selectedChat]);

  const fetchLoggedInUser = async () => {
    try {
      const { data } = await API.get("/users/profile");
      setUserProfile(data);
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
        sender: userProfile._id,
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

  const ChatList = () => {
    return (
      <div className="p-4">
        <div className="flex justify-between">
          <h2 className="text-lg font-mono font-semibold mb-4">Chats</h2>
          <button onClick={() => dispatch(performAction("USERS_LIST"))}>
            <img
              src={newMessage}
              alt="new message Icon"
              width="20"
              height="20"
            />
          </button>
        </div>
        {chats.length === 0 ? (
          <p>No chats available. Start a new chat!</p>
        ) : (
          chats.map((chat) => {
            const uu = chat.users.find((u) => u._id !== userProfile?._id);
            return (
              <div
                key={chat._id}
                className="p-2 border-b-2 cursor-pointer flex items-center rounded-lg hover:bg-gray-300 transition duration-300"
                onClick={() => setSelectedChat(chat)}
              >
                <img
                  src={
                    uu?.profilePic
                      ? `http://localhost:5000${uu.profilePic}`
                      : avatar
                  }
                  alt={uu?.name}
                  className="w-10 h-10 rounded-full mr-2"
                />
                <div>
                  <span className="font-medium">{uu?.name}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };
  const renderLeftPanel = () => {
    switch (userAction) {
      case "PROFILE":
        return <Profile profile={userProfile} />;
      case "USERS_LIST":
        return <UserList handleNewChat={handleNewChat} />;
      case "SETTINGS":
        return <Settings profile={userProfile} />;
      default:
        return <ChatList />;
    }
  };
  return (
    <div className="flex">
      {userProfile && <SideBar profile={userProfile} />}
      <div className="flex h-screen font-sans w-full">
        {/* Left Panel - Chat List */}
        <div className="w-1/3   overflow-auto border-x">
          {renderLeftPanel()}
        </div>

        {/* Right Panel - Chat or New Chat */}
        <div className="w-2/3 bg-gray-200">
          {selectedChat ? (
            <div className="h-full flex flex-col justify-between">
              {(() => {
                const otherUser = selectedChat.users.find(
                  (u) => u._id !== userProfile?._id
                );

                return (
                  <>
                    <div className="bg-white p-4 flex items-center">
                      <button
                        className="pr-4"
                        onClick={() => {
                          setSelectedChat(null);
                        }}
                      >
                        <img
                          src={back}
                          alt="back Icon"
                          width="20"
                          height="20"
                        />
                      </button>
                      <img
                        src={
                          otherUser?.profilePic
                            ? `http://localhost:5000${otherUser.profilePic}`
                            : avatar
                        }
                        alt={otherUser?.name}
                        className="w-10 h-10 rounded-full mr-2"
                      />
                      <h2 className="font-semibold">{otherUser?.name}</h2>
                    </div>

                    <div className="flex-1 overflow-auto border p-4 mb-4">
                      {messages.map((msg, index) => (
                        <div
                          key={index}
                          className={
                            msg.sender._id === userProfile._id
                              ? "text-right mb-2"
                              : "text-left mb-2"
                          }
                        >
                          <p
                            className={`p-2 inline-block rounded-lg ${
                              msg.sender._id === userProfile._id
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
                      className="flex p-4"
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
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="p-4 flex flex-col items-center justify-center h-full text-gray-500">
              <img src="https://static.whatsapp.net/rsrc.php/v4/y6/r/wa669aeJeom.png" />
              <div className="text-4xl font-light">
                Download WhatsUp for Windows.
              </div>
              <p className="p-5">
                Make calls, share your screen and get a faster experience when
                you download the Windows app.
              </p>
              <button className="rounded-full py-2 px-4 bg-teal-500 text-white">
                Download
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
