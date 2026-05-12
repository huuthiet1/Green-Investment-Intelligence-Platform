import React, { useEffect, useRef, useState } from "react";
import {
  FilePlus,
  ImagePlus,
  Mic,
  Phone,
  Send,
  Square,
} from "lucide-react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({
  conversation,
  messages,
  input,
  setInput,
  onSend,
  onSendAttachment,
  onStartCall,
  currentUserId,
  typingText,
}) {
  const bottomRef = useRef(null);
  const imageRef = useRef(null);
  const fileRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [recording, setRecording] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        const file = new File([blob], `voice-${Date.now()}.webm`, {
          type: "audio/webm",
        });

        await onSendAttachment(file, "audio");

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setRecording(true);
    } catch (error) {
      console.error(error);
      alert("Không thể truy cập micro");
    }
  };

  const stopRecord = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  if (!conversation) {
    return (
      <main className="flex flex-1 items-center justify-center text-white/50">
        Chọn một cuộc trò chuyện để bắt đầu
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col bg-slate-950">
      <header className="flex items-center justify-between border-b border-white/10 p-5">
        <div>
          <h2 className="text-xl font-bold">
            {conversation.title || "Cuộc trò chuyện"}
          </h2>

          <p className="text-sm text-white/45">
  {currentUserId === "investor-demo"
    ? "Bạn đang chat với doanh nghiệp"
    : "Bạn đang chat với nhà đầu tư"}
</p>
        </div>

        <button
          onClick={onStartCall}
          className="rounded-2xl bg-green-500 px-4 py-3 text-slate-950 hover:bg-green-400"
        >
          <Phone className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id || msg.id}
            message={msg}
            currentUserId={currentUserId}
          />
        ))}

        {typingText && (
          <p className="text-sm text-green-300">{typingText}</p>
        )}

        <div ref={bottomRef} />
      </div>

      <footer className="border-t border-white/10 p-4">
        <form onSubmit={onSend} className="flex gap-3">
          <button
            type="button"
            onClick={() => imageRef.current?.click()}
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 text-white/70 hover:bg-white/5"
          >
            <ImagePlus className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 text-white/70 hover:bg-white/5"
          >
            <FilePlus className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={recording ? stopRecord : startRecord}
            className={`rounded-2xl px-4 ${
              recording
                ? "bg-red-500 text-white"
                : "border border-white/10 bg-slate-900 text-white/70 hover:bg-white/5"
            }`}
          >
            {recording ? (
              <Square className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>

          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onSendAttachment(file, "image");
              e.target.value = "";
            }}
          />

          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onSendAttachment(file, "file");
              e.target.value = "";
            }}
          />

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/35"
          />

          <button
            type="submit"
            className="rounded-2xl bg-green-500 px-5 text-slate-950 hover:bg-green-400"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </footer>
    </main>
  );
}