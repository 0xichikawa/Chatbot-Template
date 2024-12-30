import React, { useState, useRef, useEffect } from 'react';
import Vapi from "@vapi-ai/web";

interface Message {
  text: string;
  isUser: boolean;
  isVoice: boolean;
}

function ChatPage() {
  const vapi = new Vapi(import.meta.env.VITE_VAPI_KEY);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutIdRef = useRef<number | null>(null); // Use number for timeout ID

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [newMessage]);

  vapi.on("message", (message) => {
    console.log(message);
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(handleSendMessage, 3000);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const message: Message = {
        text: newMessage,
        isUser: true,
        isVoice: isRecording,
      };
      vapi.say(newMessage, true)
      setMessages([...messages, message]);
      setNewMessage('');
      inputRef.current?.focus();
    }
  };

  const handleStartRecording = () => {
    if (isRecording) {
      setIsRecording(false)
    } else {
      setIsRecording(true);
      vapi.start(import.meta.env.VITE_CHAT_ID);
      vapi.send({
        type: "add-message",
        message: {
          role: "system",
          content: newMessage,
        },
      });
    }

    // Start WebRTC recording here (using a library like simple-peer)
  };

  // const handleStopRecording = () => {
  //   setIsRecording(false);
  //   // Stop WebRTC recording here 
  //   handleSendMessage();
  // };

  return (
    <div className="flex w-screen h-screen p-5">
      <div className="w-full bg-gray-100">
        <div className="flex flex-col-reverse h-[calc(100vh-10rem)] overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg mb-2 ${message.isUser ? 'bg-blue-200' : 'bg-gray-300'
                }`}
            >
              {message.text} {message.isVoice && '(Voice Message)'}
            </div>
          ))}
        </div>
        <div className="flex mt-4">
          <input
            type="text"
            ref={inputRef}
            value={newMessage}
            onChange={handleInputChange}
            className="flex-grow p-2 rounded-lg border border-gray-300"
            placeholder="Type your message or click to record..."
          />
          <div className="flex">
            <button
              onClick={handleStartRecording}
              className={`ml-2 p-2 rounded-lg ${isRecording ? 'bg-red-500 text-white' : 'bg-red-300'
                }`}
            >
              {isRecording ? 'Stop Recording' : 'Record'}
            </button>
            <button
              onClick={handleSendMessage}
              className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
              disabled={newMessage.trim() === ''}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;