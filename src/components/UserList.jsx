import React, { useEffect, useState } from "react";
import API from "../api/api";
import back from "../assets/back-arrow.svg";
import avatar from "../assets/avatar.png";
import { performAction } from "../reducers/userActionSlice";
import { useDispatch } from "react-redux";

const UserList = ({ handleNewChat }) => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/users");
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <button onClick={() => dispatch(performAction("DEFAULT"))}>
          <img src={back} alt="back Icon" width="20" height="20" />
        </button>
        <h2 className="text-lg font-mono font-semibold px-4">
          Start a New Chat
        </h2>
      </div>
      <input
        type="text"
        placeholder="Search name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 w-full mb-4 rounded-md bg-gray-200"
      />
      {filteredUsers.map((u) => (
        <button
          key={u._id}
          onClick={() => handleNewChat(u._id)}
          className="flex w-full p-2 bg-white mb-2 rounded"
        >
          <img
            src={u.profilePic ? `http://localhost:5000${u.profilePic}` : avatar}
            alt={u.name}
            className="w-10 h-10 rounded-full mr-2"
          />
          <span>{u.name}</span>
        </button>
      ))}
    </div>
  );
};

export default UserList;
