import React, { useState } from "react";
import API from "../api";

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    if (!query) return;
    const response = await API.get(`/users?search=${query}`);
    setUsers(response.data);
  };

  const handleToggleUser = (user) => {
    if (selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length < 2) {
      alert("Group name and at least 2 users are required");
      return;
    }

    try {
      const response = await API.post("/chats/group", {
        name: groupName,
        users: JSON.stringify(selectedUsers.map((u) => u._id)),
      });
      onGroupCreated(response.data);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96 relative">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Create Group Chat</h2>
        <input
          className="w-full p-2 mb-2 border rounded"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <input
          className="w-full p-2 mb-2 border rounded"
          placeholder="Search Users"
          onChange={handleSearch}
        />
        <div className="max-h-40 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => handleToggleUser(user)}
              className="cursor-pointer p-2 hover:bg-gray-200"
            >
              {user.name}{" "}
              {selectedUsers.find((u) => u._id === user._id) ? "✅" : ""}
            </div>
          ))}
        </div>
        <button
          onClick={handleCreateGroup}
          className="mt-4 w-full bg-teal-500 text-white p-2 rounded-md hover:bg-teal-600 transition duration-200"
        >
          Create Group
        </button>
      </div>
    </div>
  );
};

export default CreateGroupModal;
