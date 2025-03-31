import React from "react";
import avatar from "../assets/avatar.png";
import settings from "../assets/settings.svg";
import { useDispatch } from "react-redux";
import { performAction } from "../reducers/userActionSlice";

const SideBar = ({ profile }) => {
  const dispatch = useDispatch();
  return (
    <div className="flex flex-col justify-end p-4 bg-gray-100">
      <button
        className="flex justify-center py-4"
        onClick={() => {
          dispatch(performAction("SETTINGS"));
        }}
      >
        <img src={settings} alt="Settings" width="20" height="20" />
      </button>
      <img
        src={
          profile?.profilePic
            ? `http://localhost:5000${profile.profilePic}`
            : avatar
        }
        alt={profile?.name}
        className="w-10 h-10 rounded-full mr-2"
        onClick={() => {
          dispatch(performAction("PROFILE"));
        }}
      />
    </div>
  );
};

export default SideBar;
