"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {

  const { repoId } = useParams();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [repoValid, setRepoValid] = useState<boolean | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollBottom();
  }, [messages]);

  // ✅ CHECK IF REPO EXISTS
  useEffect(() => {

    const checkRepo = async () => {
      try {

        const res = await api.get(`/repos/${repoId}`);

        if (res.data.repo) {
          setRepoValid(true);
        } else {
          router.push("/404");
        }

      } catch (err) {
        router.push("/404");
      }
    };

    if (repoId) checkRepo();

  }, [repoId]);

  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {

      const res = await api.post("/query/ask", {
        repoId,
        question: input
      });

      const aiMessage: Message = {
        role: "assistant",
        content: res.data.answer || "No response"
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong."
        }
      ]);
    }

    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  // ⏳ WAIT UNTIL REPO VALIDATION
  if (repoValid === null) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">

      <div className="border-b border-zinc-800 p-5 text-lg font-semibold">
        RepoLens Chat
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {messages.map((msg, i) => (

          <div
            key={i}
            className={`max-w-[70%] p-4 rounded-lg ${
              msg.role === "user"
                ? "ml-auto bg-blue-600"
                : "bg-zinc-800"
            }`}
          >
            {msg.content}
          </div>

        ))}

        {loading && (
          <div className="bg-zinc-800 p-4 rounded-lg w-fit">
            Thinking...
          </div>
        )}

        <div ref={bottomRef} />

      </div>

      <div className="border-t border-zinc-800 p-4 flex gap-3">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask something about the codebase..."
          className="flex-1 bg-zinc-900 p-3 rounded outline-none"
        />

        <button
          onClick={sendMessage}
          className="bg-purple-600 px-5 py-3 rounded"
        >
          Send
        </button>

      </div>

    </div>
  );
}