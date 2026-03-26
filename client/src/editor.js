import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const SAVE_INTERVAL_MS = 2000;

export default function Editor() {
  const { id } = useParams();
  const [socket, setSocket] = useState();
  const [value, setValue] = useState("");

  useEffect(() => {
    const s = io("http://localhost:5000");
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.once("load-document", (data) => {
      setValue(data);
    });

    socket.emit("get-document", id);
  }, [socket, id]);

  useEffect(() => {
    if (!socket) return;

    const interval = setInterval(() => {
      socket.emit("save-document", value);
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [socket, value]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive-changes", (delta) => {
      setValue(delta);
    });

    return () => socket.off("receive-changes");
  }, [socket]);

  const handleChange = (content) => {
    setValue(content);
    socket.emit("send-changes", content);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Collaborative Editor</h2>
      <ReactQuill value={value} onChange={handleChange} />
    </div>
  );
}