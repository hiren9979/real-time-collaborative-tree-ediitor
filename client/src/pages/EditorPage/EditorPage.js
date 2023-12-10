/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import Client from "../../components/Client";
import { initSocket } from "../../socket";
import ACTIONS from "../../actions/Actions";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import Canvas from "./Canvas";
import "./Editor.css";

function EditorPage() {
  const socketRef = useRef(null);
  const nodesRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
        user_id: location.state?.user_id,
      });

      // Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
          }

          // Update the clients list with a unique list of clients using socketId
          const uniqueClients = clients.filter(
            (client, index, self) =>
              index === self.findIndex((c) => c.username === client.username)
          );

          setClients(uniqueClients);
          // for syncing the code from the start
          socketRef.current.emit(ACTIONS.SYNC_TREE, {
            nodes: nodesRef.current,
            socketId,
          });
        }
      );

      // listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        if (username) {
          toast.success(`${username} left the room`);
          setClients((prevClients) => {
            return prevClients.filter((client) => client.username !== username);
          });
        }
      });

      socketRef.current.on(ACTIONS.TREE_CHANGE, ({ nodes }) => {
        if (nodes !== null) {
          nodesRef.current.setValue(nodes);
        }
      });
    };

    if (location.state?.username) init();

    const removeUser = (e) => {
      // socket.emit("disconnect", { user_id: user.user_id });
      socketRef.current.emit(ACTIONS.LEAVE_ROOM, {
        roomId,
        username: location.state.username,
        user_id: location.state.user_id,
      });
    };

    window.addEventListener("beforeunload", removeUser);

    // listener cleaning function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
        socketRef.current.off(ACTIONS.TREE_CHANGE);
        window.removeEventListener("beforeunload", removeUser);
      }
    };
  }, [location.state?.username, reactNavigator, roomId]);

  // leave the room
  function leaveRoom() {
    socketRef.current.emit(ACTIONS.LEAVE_ROOM, {
      roomId,
      username: location.state.username,
      user_id: location.state.user_id,
    });

    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");

    reactNavigator("/");
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <h3>Connected</h3>

          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>

        <button className="btn leaveBtn" onClick={leaveRoom}>
          Logout
        </button>
      </div>
      <div className="editorWrap" style={{ background: "azure" }}>
        <Canvas
          socketRef={socketRef}
          roomId={roomId}
          onTreeChange={(nodes) => {
            nodesRef.current = nodes;
          }}
        />
      </div>
    </div>
  );
}

export default EditorPage;
