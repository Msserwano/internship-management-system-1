// src/pages/applicant/Messages.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Send, Search, Paperclip, CheckCheck } from "lucide-react";

const INITIAL_CONVERSATIONS = [
  {
    id: "C1",
    name: "KCCA HR Helpdesk",
    role: "Human Resources Directorate",
    avatar: null,
    unread: 1,
    messages: [
      { id: "m1", sender: "hr", text: "Hello Sarah! We have received your documents for the Software Development Internship.", time: "10:30 AM" },
      { id: "m2", sender: "user", text: "Thank you! Please let me know if any additional verification is needed.", time: "10:32 AM" },
      { id: "m3", sender: "hr", text: "Your interview has been scheduled for August 5th at 10:00 AM in Boardroom 2.", time: "10:45 AM" },
    ],
  },
  {
    id: "C2",
    name: "Mr. Peter Mwesigwa",
    role: "ICT Supervisor",
    avatar: null,
    unread: 0,
    messages: [
      { id: "m4", sender: "hr", text: "Welcome Sarah! We look forward to meeting you during the technical evaluation.", time: "Yesterday" },
    ],
  },
];

const Messages = () => {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState("C1");
  const [inputMessage, setInputMessage] = useState("");

  const activeConv = conversations.find(c => c.id === activeId);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: `m_${Date.now()}`,
      sender: "user",
      text: inputMessage,
      time: "Just now",
    };

    setConversations(prev =>
      prev.map(c => (c.id === activeId ? { ...c, messages: [...c.messages, newMsg] } : c))
    );
    setInputMessage("");
  };

  return (
    <div className="page-container">
      <Breadcrumbs />

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Messages & Support</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Communicate with KCCA HR officers and internship supervisors.
        </p>
      </div>

      {/* Chat Container */}
      <div className="card h-[600px] flex flex-col md:flex-row overflow-hidden">
        {/* Left: Conversation List */}
        <div className="w-full md:w-80 border-r border-slate-100 dark:border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <Input placeholder="Search messages..." icon={Search} className="!py-2 text-xs" />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
            {conversations.map((conv) => {
              const lastMsg = conv.messages[conv.messages.length - 1];
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveId(conv.id)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition ${
                    activeId === conv.id
                      ? "bg-primary-50/70 dark:bg-primary-900/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <Avatar name={conv.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{conv.name}</p>
                      <span className="text-[10px] text-slate-400">{lastMsg?.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{lastMsg?.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Message Detail & Input */}
        {activeConv ? (
          <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-800/30">
            {/* Header */}
            <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <Avatar name={activeConv.name} size="sm" />
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{activeConv.name}</p>
                <p className="text-xs text-slate-400">{activeConv.role}</p>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {activeConv.messages.map((msg) => {
                const isMe = msg.sender === "user";
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs md:max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                        isMe
                          ? "bg-primary-500 text-white rounded-br-none"
                          : "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm rounded-bl-none"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 text-[10px] ${isMe ? "text-primary-100" : "text-slate-400"}`}>
                        <span>{msg.time}</span>
                        {isMe && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message to KCCA HR..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="form-input flex-1"
              />
              <Button type="submit" variant="primary" size="md" icon={Send}>
                Send
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
