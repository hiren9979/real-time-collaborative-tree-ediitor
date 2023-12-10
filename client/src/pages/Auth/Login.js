import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      // redirect
      navigate(`/editor/1`, {
        state: {
          username: JSON.parse(localStorage.getItem("currentUser"))?.username,
          user_id: JSON.parse(localStorage.getItem("currentUser"))?.user_id,
        },
      });
    }
  });

  const joinRoom = async () => {
    try {
      if (!password || !username) {
        toast.error("username and password is required!");
        return;
      }

      const response = await api.post(`/auth/login`, { username, password });

      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("currentUser", JSON.stringify(response.data.user));

      toast.success("Login Successfully");

      // redirect
      navigate(`/editor/1`, {
        state: {
          username,
          user_id: response.data.user?.user_id,
        },
      });
    } catch (error) {
      if (error.statusCode === 401) {
        toast.error("Invalid username or password");
      } else {
        toast.error("An error occurred during authentication");
      }
    }
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <h4 className="mainLabel">Login</h4>

        <div className="inputGroup">
          <input
            type="text"
            className="inputBox"
            placeholder="USERNAME"
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            value={username}
            onKeyUp={handleInputEnter}
          />

          <input
            type="password"
            className="inputBox"
            placeholder="PASSWORD"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            value={password}
            onKeyUp={handleInputEnter}
          />

          <button className="btn joinBtn" onClick={joinRoom}>
            Login
          </button>

          <span className="createInfo">
            If you don&apos;t have an account then&nbsp;
            <Link to="/register" className="createNewBtn">
              register
            </Link>
          </span>
        </div>
      </div>

      <footer>
        <h4>
          Built with 💛 &nbsp; by &nbsp;
          <a href="https://github.com/">Hiren Chavda</a>
        </h4>
      </footer>
    </div>
  );
}

export default Login;
