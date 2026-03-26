"use client"
import React, { useEffect, useState, useRef } from 'react';
import { User, Image as ImageIcon, Send, X, Loader, CheckCheck, Check, ArrowLeft, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import Axios from '../../axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

const MessageInput = ({ selectedUser, setMessages }) => {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const onEmojiClick = (emojiData) => {
        setText((prev) => prev + emojiData.emoji);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imagePreview) return;
        
        try {
            setIsSending(true);
            setShowEmojiPicker(false);
            const { data } = await Axios.post(`/message/send/${selectedUser._id}`, {
                text: text.trim(),
                image: imagePreview,
            });

            if (data.success) {
                setMessages((prev) => [...prev, data.message]);
                setText("");
                setImagePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        } catch (error) {
            toast.error("Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-[10px] bg-[#202c33] shrink-0 border-t border-[#313d45] relative">
            {/* Emoji Picker Popover */}
            {showEmojiPicker && (
                <div className="absolute bottom-[70px] left-2 z-50 shadow-2xl" ref={emojiPickerRef}>
                    <EmojiPicker 
                        theme="dark" 
                        onEmojiClick={onEmojiClick}
                        skinTonesDisabled
                        searchPlaceholder="Search emoji..."
                        width={320}
                        height={400}
                    />
                </div>
            )}

            {imagePreview && (
                <div className="mb-3 relative w-24 h-24 bg-[#111b21] p-2 rounded-lg border border-[#313d45]">
                    <img src={imagePreview} className="w-full h-full object-cover rounded-md" alt="" />
                    <button 
                        type="button"
                        onClick={() => setImagePreview(null)} 
                        className="absolute -top-2 -right-2 bg-[#ea5664] rounded-full p-1 shadow-lg hover:bg-[#d44a58]"
                    >
                        <X className="w-3 h-3 text-white" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-3 px-2">
                <div className="flex items-center gap-2">
                    <button 
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`transition-colors ${showEmojiPicker ? 'text-[#00a884]' : 'text-[#8696a0] hover:text-[#e9edef]'}`}
                    >
                        <Smile className="w-6 h-6" />
                    </button>

                    <input 
                        type="file" accept="image/*" className="hidden" ref={fileInputRef} 
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setImagePreview(reader.result);
                                reader.readAsDataURL(file);
                            }
                        }} 
                    />
                    
                    <button 
                        type="button" onClick={() => fileInputRef.current?.click()} 
                        className="text-[#8696a0] hover:text-[#e9edef] transition-colors"
                    >
                        <ImageIcon className="w-6 h-6" />
                    </button>
                </div>

                <input 
                    type="text" 
                    placeholder="Type a message" 
                    className="flex-1 bg-[#2a3942] border-none rounded-lg py-2.5 px-4 text-[15px] text-[#d1d7db] outline-none placeholder:text-[#8696a0]" 
                    value={text} 
                    onChange={(e) => setText(e.target.value)} 
                    onFocus={() => setShowEmojiPicker(false)}
                />

                <button 
                    type="submit" 
                    disabled={isSending || (!text.trim() && !imagePreview)} 
                    className="text-[#8696a0] hover:text-[#00a884] disabled:opacity-30 transition-colors"
                >
                    {isSending ? <Loader className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                </button>
            </form>
        </div>
    );
};

const ChatContainer = ({ selectedUser, setSelectedUser, messages, setMessages }) => {
    const { user: authUser, socket, onlineUsers } = useAuth();
    const [loading, setLoading] = useState(false);
    const messageEndRef = useRef(null);
    const isOnline = onlineUsers.includes(selectedUser?._id);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!socket || !selectedUser) return;

        const handleNewMessage = (newMessage) => {
            if (newMessage.senderId === selectedUser._id) {
                setMessages((prev) => [...prev, newMessage]);
                socket.emit("markMessageAsSeen", {
                    messageId: newMessage._id,
                    senderId: newMessage.senderId,
                    receiverId: authUser._id
                });
            }
        };

        const handleMessagesSeen = ({ seenBy }) => {
            if (seenBy === selectedUser._id) {
                setMessages((prev) => 
                    prev.map((msg) => 
                        msg.senderId === authUser?._id ? { ...msg, seen: true } : msg
                    )
                );
            }
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("messagesSeen", handleMessagesSeen);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messagesSeen", handleMessagesSeen);
        };
    }, [socket, selectedUser?._id, authUser?._id, setMessages]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedUser?._id) return;
            try {
                setLoading(true);
                const { data } = await Axios.get(`/message/${selectedUser._id}`);
                if (data.success) setMessages(data.messages || []);
            } catch (err) {
                toast.error("Could not load messages");
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [selectedUser?._id, setMessages]);

    return (
        <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0b141a] overflow-hidden relative">
            {/* Header */}
            <header className="h-[59px] min-h-[59px] px-4 bg-[#202c33] flex items-center justify-between shrink-0 z-20 border-b border-[#313d45]/50">
                <div className="flex items-center gap-3 min-w-0">
                    <button 
                        onClick={() => setSelectedUser(null)} 
                        className="md:hidden p-1 -ml-2 text-[#8696a0] hover:bg-[#2a3942] rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-[#6a7175] overflow-hidden shrink-0">
                        {selectedUser.profilePic ? (
                            <img src={selectedUser.profilePic} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#cfd3d5]">
                                <User className="w-6 h-6" />
                            </div>
                        )}
                    </div>
                    
                    <div className="min-w-0">
                        <h3 className="text-[16px] font-normal text-[#e9edef] truncate leading-tight">
                            {selectedUser.fullName}
                        </h3>
                        <p className={`text-[12px] ${isOnline ? 'text-[#00a884]' : 'text-[#8696a0]'}`}>
                            {isOnline ? "online" : "offline"}
                        </p>
                    </div>
                </div>

                <button 
                    onClick={() => setSelectedUser(null)}
                    className="p-2 text-[#8696a0] hover:bg-[#2a3942] rounded-full transition-all group"
                    title="Close chat"
                >
                    <X className="w-5 h-5 group-hover:text-[#ea5664]" />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar-style relative bg-[#0b141a]">
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none" 
                     style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}>
                </div>
                
                <style jsx>{`
                    .custom-scrollbar-style::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar-style::-webkit-scrollbar-thumb { background: #374248; }
                `}</style>
                
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader className="animate-spin text-[#00a884] w-10 h-10" />
                    </div>
                ) : (
                    <div className="relative z-10 flex flex-col gap-1">
                        {messages.map((msg) => {
                            const isMe = msg.senderId === authUser?._id;
                            return (
                                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                                    <div className={`max-w-[85%] md:max-w-[65%] px-2 py-1.5 rounded-lg shadow-sm relative ${
                                        isMe ? 'bg-[#005c4b] text-[#e9edef]' : 'bg-[#202c33] text-[#e9edef]'
                                    }`}>
                                        {msg.image && (
                                            <img src={msg.image} className="rounded-md mb-1 max-h-72 w-full object-cover" alt="attachment" />
                                        )}
                                        {msg.text && (
                                            <p className="text-[14.2px] leading-relaxed pr-12 break-words">{msg.text}</p>
                                        )}
                                        <div className="absolute bottom-1 right-1.5 flex items-center gap-1 min-w-[40px] justify-end">
                                            <span className="text-[10px] text-[#8696a0] font-light">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </span>
                                            {isMe && (
                                                msg.seen 
                                                ? <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" /> 
                                                : <Check className="w-3.5 h-3.5 text-[#8696a0]" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div ref={messageEndRef} className="pb-2" />
            </main>

            <MessageInput selectedUser={selectedUser} setMessages={setMessages} />
        </div>
    );
};

export default ChatContainer;