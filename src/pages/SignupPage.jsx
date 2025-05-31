import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePic: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePic") {
      setFormData({ ...formData, profilePic: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    const formDataToSend = new FormData();
    for (let key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      const response = await API.post("/users/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      localStorage.setItem("token", response.data.token);
      navigate("/chats");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-md rounded-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Signup</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          className="w-full p-2 mb-2 border rounded"
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 mb-2 border rounded"
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 mb-2 border rounded"
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 mb-2 border rounded"
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 mb-4 border rounded"
          type="file"
          name="profilePic"
          accept="image/*"
          onChange={handleChange}
        />

        <button className="w-full bg-teal-500 text-white py-2 rounded hover:bg-teal-600">
          Sign Up
        </button>
        <p className="mt-4">
          Already have an account?{" "}
          <a href="/" className="text-teal-500">
            Login
          </a>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
