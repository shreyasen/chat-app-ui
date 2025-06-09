import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { performAction } from "../reducers/userActionSlice";
import { io } from "socket.io-client";
import API from "../api";
import { APP_URL } from "../constants";
import SideBar from "../components/SideBar";
import UserList from "../components/UserList";
import Profile from "../components/Profile";
import Settings from "../components/Settings";
import CreateGroupModal from "../components/CreateGroupModal";
import Chat from "../components/Chat";
import background from "../assets/background.png";
import avatar from "../assets/avatar.png";
import group from "../assets/group.png";
import newMessage from "../assets/new-message.svg";

const socket = io(APP_URL);

const ChatPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      if (error.status === 401) {
        navigate("/");
      }
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

  const handleChatSelection = async (chat) => {
    setSelectedChat(chat);

    // Mark chat as read on backend
    try {
      await API.put(`/chats/${chat._id}/read`, {});

      // Remove unreadCount locally
      setChats((prev) =>
        prev.map((c) => (c._id === chat._id ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error("Error marking chat as read:", err);
    }
  };
  useEffect(() => {
    if (selectedChat) {
      dispatch(performAction("CHAT_SELECTED"));
      handleChatSelection(selectedChat);
      fetchMessages();
    }
  }, [selectedChat]);

  const handleNewChat = async (userId) => {
    try {
      const { data } = await API.post("/chats", { userId });
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
            const uu = chat.users?.find((u) => u._id !== userProfile?._id);
            return (
              <div
                key={chat._id}
                className="p-2 border-b cursor-pointer flex items-center rounded-sm hover:bg-gray-100 transition duration-300"
                onClick={() => setSelectedChat(chat)}
              >
                <img
                  src={
                    chat.isGroupChat
                      ? chat.groupAvatar || group
                      : uu?.profilePic
                      ? uu.profilePic
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
                        const messageDate = chat.latestMessage
                          ? new Date(chat.latestMessage?.createdAt)
                          : new Date(chat.updatedAt);
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
          className="w-2/3  bg-gray-200"
          style={{ backgroundImage: `url(${background})` }}
        >
          {renderRightPanel()}
        </div>
        {userAction === "GROUPS" && (
          <CreateGroupModal
            onClose={() => dispatch(performAction("DEFAULT"))}
            onGroupCreated={handleGroupCreated}
          />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
