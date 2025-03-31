import React from "react";
import avatar from "../assets/avatar.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faMessage,
  faBell,
  faKeyboard,
  faCircleQuestion,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { performAction } from "../reducers/userActionSlice";

const Settings = ({ profile }) => {
  const dispatch = useDispatch();
  return (
    <div>
      <h1 className="font-bold text-lg p-4">Settings</h1>
      <div
        className="flex items-center p-6 hover:bg-gray-100 cursor-pointer"
        onClick={() => dispatch(performAction("PROFILE"))}
      >
        <img
          src={
            profile?.profilePic
              ? `http://localhost:5000${profile.profilePic}`
              : avatar
          }
          alt={profile?.name}
          className="w-20 h-20 rounded-[50%]"
        />
        <div className="px-6">{profile.name}</div>
      </div>
      <div className="flex flex-col">
        <button className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-100">
          <FontAwesomeIcon icon={faUser} size="2x" />
          <span className="px-4">Account</span>
        </button>
        <button className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-100">
          <FontAwesomeIcon icon={faLock} size="2x" />
          <span className="px-4">Privacy</span>
        </button>
        <button className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-100">
          <FontAwesomeIcon icon={faMessage} size="2x" />
          <span className="px-4">Chats</span>
        </button>
        <button className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-100">
          <FontAwesomeIcon icon={faBell} size="2x" />
          <span className="px-4">Notifications</span>
        </button>
        <button className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-100">
          <FontAwesomeIcon icon={faKeyboard} size="2x" />
          <span className="px-4">Keyboard Shortcuts</span>
        </button>
        <button className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-100">
          <FontAwesomeIcon icon={faCircleQuestion} size="2x" />
          <span className="px-4">Help</span>
        </button>
        <button className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-100">
          <FontAwesomeIcon icon={faRightFromBracket} size="2x" />
          <span className="px-4">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
