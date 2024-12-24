import React, { useState, useEffect, useRef } from "react";
import "./App.css";

interface Message {
  id: number;
  text: string;
  sender: "user" | "system";
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addMessage = (text: string, sender: "user" | "system") => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now(), text, sender },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addMessage(input, "user");
      setInput("");
      setTimeout(() => {
        addMessage("Access denied. Try again.", "system");
      }, 1000);
    }
  };

  useEffect(() => {
    addMessage("Welcome to the secure chat. Proceed with caution.", "system");
  }, []);

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
          <div key={message.id} className={`message ${message.sender}`}>
            <span className="prefix">
              {message.sender === "user" ? ">" : "#"}
            </span>{" "}
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
