import React, { useState, useEffect, useRef } from "react";
import "./App.css";

interface Message {
  id: number;
  text: string;
  sender: string; // Dynamic sender for user names
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const userName = `User-${Math.floor(Math.random() * 1000)}`; // Random user name

  useEffect(() => {
    // Connect to WebSocket server
    socketRef.current = new WebSocket("ws://your-websocket-server-url");
    
    // Handle incoming messages
    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data) as Message;
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    // Cleanup on unmount
    return () => {
      socketRef.current?.close();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socketRef.current) {
      const message = { id: Date.now(), text: input, sender: userName };
      socketRef.current.send(JSON.stringify(message)); // Send message to server
      setInput("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>// Secure Chat Terminal</h1>
      </header>
      <div className="chat-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender === userName ? "user" : "system"}`}>
            <span className="prefix">{message.sender === userName ? ">" : `${message.sender}:`}</span>{" "}
            {message.text}
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
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}
