import { useState, useEffect } from "react";
import axios from "../../services/api";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate inputs
      if (!username || !password) {
        toast.error("username and password is required!");
        return;
      }

      const response = await axios.post(`/auth/register`, {
        username,
        password,
      });

      toast.success(response.data.message);
      navigate("/");
    } catch (error) {
      if (error.statusCode === 400) {
        toast.error(error.error.response.data.error);
      } else {
        toast.error(error.error.response.data.error);
      }
    }
  };

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <h4 className="mainLabel">Register</h4>
        <div className="inputGroup">
          <input
            type="text"
            className="inputBox"
            placeholder="username"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyUp={handleInputEnter}
          />
          <input
            type="password"
            className="inputBox"
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            onKeyUp={handleInputEnter}
          />
          <button className="btn joinBtn" onClick={handleSubmit}>
            Register
          </button>
          <span className="createInfo">
            If you have an account then &nbsp;
            <Link to="/" className="createNewBtn">
              Login
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
};

export default Register;
