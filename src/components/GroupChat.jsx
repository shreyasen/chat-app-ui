import React from "react";
import { useDispatch } from "react-redux";
import { performAction } from "../reducers/userActionSlice";
import { groupMessagesByDate } from "../utils";
import back from "../assets/back-arrow.svg";
import group from "../assets/group.png";
import avatar from "../assets/avatar.png";

const GroupChat = ({
  selectedChat,
  messages,
  userProfile,
  message,
  setMessage,
  handleSendMessage,
  setSelectedChat,
}) => {
  const dispatch = useDispatch();

  const groupedMessages = groupMessagesByDate(messages);
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="bg-white p-4 flex items-center">
        <button
          className="pr-4"
          onClick={() => {
            setSelectedChat(null);
            dispatch(performAction("DEFAULT"));
          }}
        >
          <img src={back} alt="Back Icon" width="20" height="20" />
        </button>
        <img
          src={group}
          alt={selectedChat.chatName}
          className="w-10 h-10 rounded-full mr-2"
        />
        <div>
          <h2 className="font-semibold">{selectedChat.chatName}</h2>
          <div className="text-sm text-gray-500">
            {selectedChat.users
              .map((user) => (user._id === userProfile._id ? "You" : user.name))
              .join(", ")}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto border p-4 mb-4">
        {Object.keys(groupedMessages).map((date) => (
          <div key={date}>
            <div className="flex justify-center">
              <span className="text-center text-gray-500 text-sm my-2 bg-white p-1 rounded-md shadow-md">
                {date}
              </span>
            </div>
            {groupedMessages[date].map((msg, index) => (
              <div
                key={index}
                className={
                  msg.sender._id === userProfile._id
                    ? "text-right mb-2"
                    : "text-left mb-2"
                }
              >
                <div
                  className={msg.sender._id !== userProfile._id ? "flex" : ""}
                >
                  {msg.sender._id !== userProfile._id && (
                    <img
                      src={
                        msg.sender.profilePic ? msg.sender.profilePic : avatar
                      }
                      alt={msg.sender.name}
                      className="w-10 h-10 rounded-full inline-block mr-2"
                    />
                  )}

                  <div
                    className={`p-2 inline-block rounded-lg ${
                      msg.sender._id === userProfile._id
                        ? "bg-green-200"
                        : "bg-white"
                    }`}
                  >
                    {msg.sender._id !== userProfile._id && (
                      <p className="text-sm text-teal-500 font-semibold">
                        {msg.sender.name}
                      </p>
                    )}

                    <span>{msg.content}</span>
                    <sub className="text-[10px] text-gray-500 ml-2">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </sub>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex p-4" style={{ width: "-webkit-fill-available" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="border p-2 w-full"
        />
        <button
          onClick={() => {
            handleSendMessage(message);
            setMessage("");
          }}
          className="ml-2 p-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default GroupChat;
