import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { performAction } from "../reducers/userActionSlice";
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

const Settings = ({ profile }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Logic for logging out the user
    localStorage.removeItem("token");
    navigate("/");
    dispatch(performAction("DEFAULT"));
  };
  return (
    <div>
      <h1 className="font-bold text-lg p-4">Settings</h1>
      <div
        className="flex items-center p-6 hover:bg-gray-100 cursor-pointer"
        onClick={() => dispatch(performAction("PROFILE"))}
      >
        <img
          src={profile?.profilePic ? profile.profilePic : avatar}
          alt={profile?.name}
          className="w-20 h-20 rounded-[50%]"
        />
        <div className="px-6">{profile?.name}</div>
      </div>
      <div className="flex flex-col">
        <button className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-100">
          <FontAwesomeIcon icon={faUser} />
          <span className="px-4">Account</span>
        </button>
        <button className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-100">
          <FontAwesomeIcon icon={faLock} />
          <span className="px-4">Privacy</span>
        </button>
        <button className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-100">
          <FontAwesomeIcon icon={faMessage} />
          <span className="px-4">Chats</span>
        </button>
        <button className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-100">
          <FontAwesomeIcon icon={faBell} />
          <span className="px-4">Notifications</span>
        </button>
        <button className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-100">
          <FontAwesomeIcon icon={faKeyboard} />
          <span className="px-4">Keyboard Shortcuts</span>
        </button>
        <button className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-100">
          <FontAwesomeIcon icon={faCircleQuestion} />
          <span className="px-4">Help</span>
        </button>
        <button
          className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-100"
          onClick={handleLogout}
        >
          <FontAwesomeIcon icon={faRightFromBracket} color="red" />
          <span className="px-4 text-red-600">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
