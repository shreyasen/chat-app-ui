import React, { useEffect, useState } from "react";
import API from "../api/api";
import { io } from "socket.io-client";

import avatar from "../assets/avatar.png";
import newMessage from "../assets/new-message.svg";
import SideBar from "../components/SideBar";
import UserList from "../components/UserList";
import { useDispatch, useSelector } from "react-redux";
import Profile from "../components/Profile";
import { performAction } from "../reducers/userActionSlice";
import Settings from "../components/Settings";
import CreateGroupModal from "../components/CreateGroupModal";
import GroupChat from "../components/GroupChat";
import Chat from "../components/Chat";
import background from "../assets/background.png";

const socket = io("http://localhost:5000");

const ChatPage = () => {
  const dispatch = useDispatch();
  const userAction = useSelector((state) => state.userAction.leftPanel);
  const [userProfile, setUserProfile] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

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

  const fetchMessages = async () => {
    try {
      const response = await API.get(`/messages/${selectedChat._id}`);
      setMessages(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLoggedInUser();
    fetchChats();
    socket.on("message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
  }, []);

  useEffect(() => {
    if (userProfile) {
      chats.forEach((chat) => {
        socket.emit("joinChat", chat._id);
      });
    }
  }, [userProfile, chats]);

  useEffect(() => {
    if (selectedChat) {
      dispatch(performAction("CHAT_SELECTED"));
      fetchMessages();
    }
  }, [selectedChat]);

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

  const handleSendMessage = async (message) => {
    if (!message.trim() || !selectedChat) return;
    try {
      const response = await API.post("/messages", {
        content: message,
        sender: userProfile._id,
        chatId: selectedChat._id,
      });
      socket.emit("sendMessage", response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleMessage = (newMessage) => {
      console.log("New message received:", newMessage);

      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex(
          (chat) => chat._id === newMessage.chat?._id
        );

        if (chatIndex !== -1) {
          const updatedChats = [...prevChats];
          const [movedChat] = updatedChats.splice(chatIndex, 1);
          movedChat.latestMessage = newMessage;

          // Mark unread if chat is not open
          if (selectedChat?._id !== newMessage.chat?._id) {
            movedChat.unreadCount = (movedChat.unreadCount || 0) + 1;
          }

          return [movedChat, ...updatedChats];
        }

        return prevChats;
      });

      // If the chat is open, update messages in the chat
      if (selectedChat?._id === newMessage.chat?._id) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    };

    socket.on("messageReceived", handleMessage);

    return () => {
      socket.off("messageReceived", handleMessage);
    };
  }, [selectedChat]);

  const handleGroupCreated = (newGroupChat) => {
    setChats((prev) => [newGroupChat, ...prev]);
  };

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
                className="p-2 border-b cursor-pointer flex items-center rounded-sm hover:bg-gray-100 transition duration-300"
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
                <div className="flex justify-between w-full">
                  <div>
                    <span>{chat.isGroupChat ? chat.chatName : uu?.name}</span>
                    <p className="text-sm text-gray-500">
                      {chat.latestMessage?.content}
                    </p>
                  </div>
                  <div>
                    {chat.unreadCount > 0 && (
                      <span className="bg-teal-500 text-white rounded-full px-2 py-1 text-xs ml-2">
                        {chat.unreadCount}
                      </span>
                    )}
                    <p className="text-xs text-gray-400">
                      {(() => {
                        const messageDate = new Date(
                          chat.latestMessage?.createdAt
                        );
                        const today = new Date();
                        const isToday =
                          messageDate.toDateString() === today.toDateString();
                        return isToday
                          ? messageDate.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : messageDate.toLocaleDateString("en-GB");
                      })()}
                    </p>
                  </div>
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
      case "GROUPS":
        return (
          <CreateGroupModal
            onClose={() => dispatch(performAction("DEFAULT"))}
            onGroupCreated={handleGroupCreated}
          />
        );
      default:
        return <ChatList />;
    }
  };
  const DefaultRightPanel = () => {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full text-gray-500">
        <img src="https://static.whatsapp.net/rsrc.php/v4/y6/r/wa669aeJeom.png" />
        <div className="text-4xl font-light">Download WhatsUp for Windows.</div>
        <p className="p-5">
          Make calls, share your screen and get a faster experience when you
          download the Windows app.
        </p>
        <button className="rounded-full py-2 px-4 bg-teal-500 text-white">
          Download
        </button>
      </div>
    );
  };
  const renderRightPanel = () => {
    switch (userAction) {
      case "CHAT_SELECTED":
        return (
          <Chat
            selectedChat={selectedChat}
            userProfile={userProfile}
            messages={messages}
            setSelectedChat={setSelectedChat}
            handleSendMessage={handleSendMessage}
          />
        );
      default:
        return <DefaultRightPanel />;
    }
  };
  return (
    <div className="flex">
      {userProfile && <SideBar profile={userProfile} />}
      <div className="flex h-screen font-sans w-full">
        {/* Left Panel - Chat List */}
        <div className="w-1/3 overflow-auto border-x">{renderLeftPanel()}</div>

        {/* Right Panel - Chat or New Chat */}
        <div
          className="w-2/3 bg-cover bg-gray-200 bg-no-repeat"
          style={{ backgroundImage: `url(${background})` }}
        >
          {renderRightPanel()}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
