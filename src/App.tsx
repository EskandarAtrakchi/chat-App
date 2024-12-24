import React, { useState, useEffect, useRef } from "react";
import "./App.css";

interface Message {
  id: number;
  text?: string;
  media?: string;
  mediaType?: "image" | "video";
  sender: "user" | "system" | "other";
  username?: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const ACCESS_PIN = import.meta.env.VITE_ACCESS_PIN;

  useEffect(() => {
    if (isAuthenticated) {
      const ws = new WebSocket("wss://chat-app-qmi1.onrender.com");
      setSocket(ws);

      ws.onmessage = async (event) => {
        let message;
        if (event.data instanceof Blob) {
          message = await event.data.text();
        } else {
          message = event.data;
        }

        const parsedMessage = JSON.parse(message);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(),
            text: parsedMessage.text,
            media: parsedMessage.media,
            mediaType: parsedMessage.mediaType,
            sender: parsedMessage.username === username ? "user" : "other",
            username: parsedMessage.username,
          },
        ]);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      return () => {
        ws.close();
      };
    }
  }, [isAuthenticated]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ACCESS_PIN) {
      setIsAuthenticated(true);
    } else {
      alert("Invalid PIN. Access denied.");
    }
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsUsernameSet(true);
    } else {
      alert("Username cannot be empty.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() || file) {
      let message: Partial<Message> = { username };

      if (input.trim()) {
        message.text = input;
      }

      if (file) {
        const mediaType = file.type.startsWith("image")
          ? "image"
          : file.type.startsWith("video")
          ? "video"
          : undefined;

        if (mediaType) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            message.media = base64;
            message.mediaType = mediaType;

            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify(message)); // Send to WebSocket
            }
          };
          reader.readAsDataURL(file);
        }
      } else {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(message)); // Send to WebSocket
        }
      }

      setInput("");
      setFile(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          text: "Welcome to the secure chat.",
          sender: "system",
        },
      ]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isAuthenticated) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Secure Chat Terminal</h1>
        </header>
        <form onSubmit={handlePinSubmit} className="pin-form">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN to access"
            className="pin-input"
          />
          <button type="submit" className="pin-button">
            Submit
          </button>
        </form>
      </div>
    );
  }

  if (!isUsernameSet) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Enter Your Username</h1>
        </header>
        <form onSubmit={handleUsernameSubmit} className="username-form">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter a username"
            className="username-input"
          />
          <button type="submit" className="username-button">
            Submit
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>// Symmetric Encryption (AES-256)</h1>
        <h1>// Hashing (SHA-256)</h1>
      </header>
      <div className="chat-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <span className="prefix">
              {message.sender === "user"
                ? `${username}:`
                : message.sender === "system"
                ? "#"
                : `${message.username || "Other"}:`}
            </span>{" "}
            {message.text && <span>{message.text}</span>}
            {message.media && message.mediaType === "image" && (
              <img src={message.media} alt="Uploaded media" className="media" />
            )}
            {message.media && message.mediaType === "video" && (
              <video controls src={message.media} className="media" />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="input-form">
        <span className="input-prefix">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your message..."
          className="message-input"
        />
        <label htmlFor="file-input" className="file-input-label">
          Choose File
        </label>
        <input
          type="file"
          id="file-input"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="file-input"
        />

        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}
