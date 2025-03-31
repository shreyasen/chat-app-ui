import React from "react";
import avatar from "../assets/avatar.png";
import settings from "../assets/settings.svg";
import { useDispatch, useSelector } from "react-redux";
import { performAction } from "../reducers/userActionSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage } from "@fortawesome/free-solid-svg-icons";

const SideBar = ({ profile }) => {
  const dispatch = useDispatch();
  const userAction = useSelector((state) => state.userAction.leftPanel);

  return (
    <div className="flex flex-col justify-between p-4 bg-gray-100">
      <button
        className={`h-10 w-10 ${
          userAction === "DEFAULT" ? "bg-gray-300 rounded-full" : ""
        }`}
        onClick={() => dispatch(performAction("DEFAULT"))}
      >
        <FontAwesomeIcon icon={faMessage} />
      </button>
      <div className="flex items-center flex-col">
        <button
          className={`mb-4 flex justify-center h-10 w-10 ${
            userAction === "SETTINGS" ? "bg-gray-300 rounded-full" : ""
          }`}
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
          className="w-10 h-10 rounded-full cursor-pointer"
          onClick={() => {
            dispatch(performAction("PROFILE"));
          }}
        />
      </div>
    </div>
  );
};

export default SideBar;
