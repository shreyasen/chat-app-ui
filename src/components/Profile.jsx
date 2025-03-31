import React from "react";
import avatar from "../assets/avatar.png";

const Profile = ({ profile }) => {
  return (
    <div>
      <h1 className="font-bold text-lg p-4">Profile</h1>
      <div className="bg-slate-100 flex justify-center p-6">
        <img
          src={
            profile?.profilePic
              ? `http://localhost:5000${profile.profilePic}`
              : avatar
          }
          alt={profile?.name}
          className="w-64 h-64 rounded-[50%]"
        />
      </div>
      <div className="px-6 pt-4">
        <p className="text-teal-500 text-sm">Your Name</p>
        <p>{profile.name}</p>
      </div>
      <div className="px-6 py-4 text-xs text-gray-500">
        This is not your username or PIN. This name will be visible to your
        WhatsApp contacts.
      </div>
      <div className="px-6">
        <p className="text-teal-500 text-sm">About</p>
        <p>{profile.status}</p>
      </div>
    </div>
  );
};

export default Profile;
