import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { performAction } from "../reducers/userActionSlice";
import { groupMessagesByDate } from "../utils";
import { APP_URL } from "../constants";
import GroupChat from "./GroupChat";
import back from "../assets/back-arrow.svg";
import avatar from "../assets/avatar.png";

const Chat = ({
  selectedChat,
  userProfile,
  messages,
  setSelectedChat,
  handleSendMessage,
}) => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="h-full flex flex-col justify-between">
      {selectedChat?.isGroupChat ? (
        <GroupChat
          selectedChat={selectedChat}
          messages={messages}
          userProfile={userProfile}
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
          setSelectedChat={setSelectedChat}
        />
      ) : (
        (() => {
          const otherUser = selectedChat?.users.find(
            (u) => u._id !== userProfile?._id
          );
          return (
            <>
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
                  src={
                    otherUser?.profilePic
                      ? `${APP_URL}${otherUser.profilePic}`
                      : avatar
                  }
                  alt={otherUser?.name}
                  className="w-10 h-10 rounded-full mr-2"
                />
                <h2 className="font-semibold">{otherUser?.name}</h2>
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
                        <p
                          className={`p-2 inline-block rounded-lg ${
                            msg.sender._id === userProfile._id
                              ? "bg-green-200"
                              : "bg-white"
                          }`}
                        >
                          <span>{msg.content}</span>
                          <sub className="text-[10px] text-gray-500 ml-2">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </sub>
                        </p>
                      </div>
                    ))}
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
                  onClick={() => {
                    handleSendMessage(message);
                    setMessage("");
                  }}
                  className="ml-2 p-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition duration-200"
                >
                  Send
                </button>
              </div>
            </>
          );
        })()
      )}
    </div>
  );
};

export default Chat;
