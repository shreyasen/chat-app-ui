import React from "react";
import avatar from "../assets/avatar.png";
import settings from "../assets/settings.svg";

const SideBar = ({ userProfile }) => {
  return (
    <div className="flex flex-col justify-end p-4 bg-gray-100">
      <button className="flex justify-center py-4" onClick={() => {}}>
        <img src={settings} alt="Settings" width="20" height="20" />
      </button>
      <img
        src={
          userProfile?.profilePic
            ? `http://localhost:5000${userProfile.profilePic}`
            : avatar
        }
        alt={userProfile?.name}
        className="w-10 h-10 rounded-full mr-2"
      />
    </div>
  );
};

export default SideBar;
