import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Check, CheckCheck, Trash2 } from 'lucide-react';

// Simple utility to replace cn/clsx if not available
function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [visitorId, setVisitorId] = useState("");
    const [visitorName, setVisitorName] = useState("");
    const [isChatStarted, setIsChatStarted] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const scrollRef = useRef(null);

    // Hardcoded API URL for production/dev
    const apiUrl = import.meta.env.VITE_API_URL || "https://api.superhomes.app";
    const brandSlug = import.meta.env.VITE_BRAND_SLUG || "themetalstore";

    useEffect(() => {
        let vid = localStorage.getItem('chat_visitor_id');
        if (!vid) {
            vid = Math.random().toString(36).substring(7);
            localStorage.setItem('chat_visitor_id', vid);
        }
        setVisitorId(vid);

        if (localStorage.getItem('chat_started') === 'true') {
            setIsChatStarted(true);
        }
    }, []);

    const fetchConversation = async (vName) => {
        if (!visitorId) return;
        const nameToSend = vName || "Guest Visitor";

        try {
            const res = await fetch(`${apiUrl}/api/v1/chat/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brand_slug: brandSlug,
                    visitor_id: visitorId,
                    visitor_name: nameToSend
                })
            });

            if (!res.ok) throw new Error("Init failed");

            const data = await res.json();
            const conversation = data.data || data;

            if (conversation.id) {
                setConversationId(conversation.id);
                setMessages(conversation.messages || []);
                setIsChatStarted(true);
                localStorage.setItem('chat_started', 'true');
                markMessagesRead(conversation.id);
            }
        } catch (err) {
            console.error("Setup error:", err);
        }
    };

    const markMessagesRead = async (convId) => {
        try {
            await fetch(`${apiUrl}/api/v1/chat/${convId}/mark_read/`, { method: 'POST' });
        } catch (e) { console.error("Mark read failed", e); }
    };

    useEffect(() => {
        if (isOpen && visitorId && isChatStarted && !conversationId) {
            fetchConversation();
        }
    }, [isOpen, visitorId, isChatStarted]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const startChat = () => {
        if (!visitorName.trim()) return;
        fetchConversation(visitorName);
    };

    const leaveChat = () => {
        setIsChatStarted(false);
        setConversationId(null);
        setMessages([]);
        setVisitorName("");
        localStorage.removeItem('chat_started');
    };

    const sendMessage = async () => {
        if (!inputValue.trim() || !conversationId) return;

        const content = inputValue;
        setInputValue("");

        const tempMsg = {
            id: Date.now(),
            sender_type: 'visitor',
            content: content,
            created_at: new Date().toISOString(),
            status: 'sent'
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            const res = await fetch(`${apiUrl}/api/v1/chat/${conversationId}/send_message/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: content,
                    sender_type: 'visitor'
                })
            });
            if (!res.ok) throw new Error("Failed to send");
        } catch (error) {
            console.error(error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const playNotificationSound = () => {
        try {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
            audio.volume = 0.5;
            audio.play().catch(e => console.error("Audio play failed", e));
        } catch (e) { console.error("Audio setup failed", e); }
    };

    useEffect(() => {
        if (!conversationId || !isOpen) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/v1/chat/${conversationId}/`);
                if (!res.ok) return;
                const data = await res.json();
                const conversation = data.data || data;

                if (conversation.messages) {
                    setMessages(prev => {
                        const newMessages = conversation.messages;
                        if (newMessages.length > prev.length) {
                            const lastMsg = newMessages[newMessages.length - 1];
                            if (lastMsg.sender_type !== 'visitor' && document.hidden) {
                                playNotificationSound();
                                document.title = "(1) New Message - The Metal Store";
                            }
                        }
                        return newMessages;
                    });
                }
            } catch (error) { console.error("Polling error", error); }
        };

        const interval = setInterval(fetchMessages, 5000);
        const handleVisibilityChange = () => {
            if (!document.hidden) document.title = "The Metal Store";
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [conversationId, isOpen, apiUrl]);

    return (
        <div className="fixed bottom-6 right-6 z-[9999]" style={{ zIndex: 9999 }}>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center justify-center rounded-full w-14 h-14 shadow-xl bg-gray-900 text-white hover:scale-105 transition-all"
                >
                    <MessageCircle className="w-8 h-8" />
                </button>
            )}

            {isOpen && (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-[350px] h-[500px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-gray-900 p-4 flex justify-between items-center text-white">
                        <div>
                            <h3 className="font-bold">Chat Support</h3>
                            <p className="text-xs opacity-80">Support Team</p>
                        </div>
                        <div className="flex gap-2">
                            {isChatStarted && (
                                <button onClick={leaveChat} className="p-1 hover:bg-white/20 rounded-full">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {!isChatStarted ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
                            <h4 className="font-semibold text-lg text-gray-800">Welcome!</h4>
                            <input
                                value={visitorName}
                                onChange={(e) => setVisitorName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900"
                            />
                            <button
                                onClick={startChat}
                                disabled={!visitorName.trim()}
                                className="w-full bg-gray-900 text-white py-2 rounded-md disabled:opacity-50 font-medium"
                            >
                                Start Chat
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50" ref={scrollRef}>
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "max-w-[85%] p-3 text-sm rounded-xl relative",
                                            msg.sender_type === 'visitor'
                                                ? "ml-auto bg-gray-900 text-white rounded-br-none"
                                                : "mr-auto bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                                        )}
                                    >
                                        <div className="mr-4 break-words">{msg.content}</div>
                                        <div className="text-[10px] opacity-70 mt-1 text-right w-full flex justify-end gap-1">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {msg.sender_type === 'visitor' && (
                                                <span className="flex items-center">
                                                    {msg.status === 'read' ? <CheckCheck className="w-3 h-3 text-gray-200" /> : <Check className="w-3 h-3" />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 border-t bg-white flex gap-2">
                                <input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type a message..."
                                    onKeyDown={handleKeyDown}
                                    className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900"
                                />
                                <button onClick={sendMessage} disabled={!inputValue.trim()} className="bg-gray-900 text-white h-9 w-9 rounded-md flex items-center justify-center disabled:opacity-50">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
