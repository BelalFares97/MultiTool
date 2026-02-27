import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageCircle, Plus, Edit2, Trash2, Send, Paperclip } from 'lucide-react';
import { getTranslation } from '../i18n/translations';

const ChatInterface = ({
    chatSessions,
    activeChatId,
    setActiveChatId,
    setChatSessions,
    chatInput,
    setChatInput,
    handleSendMessage,
    isThinking,
    clientLogo,
    userImage,
    language
}) => {
    const t = getTranslation(language);
    const messagesEndRef = useRef(null);
    const chatInputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatSessions, activeChatId, isThinking]);

    const activeSession = chatSessions.find(c => c.id === activeChatId);

    return (
        <div className="fade-in chat-layout">
            {/* Chat Sidebar */}
            <div className="chat-sidebar">
                <button
                    className="btn-new-case"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                        const newId = `chat-${Date.now()}`;
                        setChatSessions(prev => [{ id: newId, title: t('new_chat'), date: 'Just now', messages: [] }, ...prev]);
                        setActiveChatId(newId);
                    }}
                >
                    <Plus size={18} /> {t('new_chat')}
                </button>

                <div className="recent-chats-list">
                    <p className="chat-list-header">{t('recent')}</p>
                    {chatSessions.map(session => (
                        <div
                            key={session.id}
                            onClick={() => setActiveChatId(session.id)}
                            className={`chat-item ${activeChatId === session.id ? 'active' : ''}`}
                        >
                            <MessageCircle size={18} style={{ opacity: 0.7 }} />
                            <div className="chat-item-title">
                                {session.title}
                            </div>
                            <div className="session-actions">
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    const newTitle = prompt(t('rename_chat_prompt'), session.title);
                                    if (newTitle) setChatSessions(prev => prev.map(c => c.id === session.id ? { ...c, title: newTitle } : c));
                                }} className="icon-btn small-action" title={t('rename')}>
                                    <Edit2 size={12} />
                                </button>
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(t('delete_chat_confirm'))) {
                                        setChatSessions(prev => prev.filter(c => c.id !== session.id));
                                        if (activeChatId === session.id) setActiveChatId(null);
                                    }
                                }} className="icon-btn small-action danger" title={t('delete')}>
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="chat-main">
                <div className="messages-list">
                    {activeChatId && activeSession?.messages.length === 0 ? (
                        <div className="chat-empty-state">
                            <div className="avatar-sm ai large-avatar">
                                <img src={clientLogo} alt="Logo" />
                            </div>
                            <h3>{t('how_can_i_help')}</h3>
                        </div>
                    ) : (
                        activeSession?.messages.map((msg) => (
                            <div key={msg.id} className={`message-row ${msg.role}`}>
                                {msg.role === 'assistant' && (
                                    <div className="avatar-sm ai">
                                        <img src={clientLogo} alt="AI" />
                                    </div>
                                )}
                                <div className={`message-bubble ${msg.role}`}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                                {msg.role === 'user' && (
                                    <div className="avatar-sm">
                                        <img src={userImage} alt="User" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}

                    {isThinking && (
                        <div className="message-row assistant thinking">
                            <div className="avatar-sm ai">
                                <img src={clientLogo} alt="AI" />
                            </div>
                            <div className="message-bubble thinking">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <span className="shimmer-text">{t('processing_request')}</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="input-area">
                    <div className="input-wrapper">
                        <input
                            ref={chatInputRef}
                            type="text"
                            className="input-field"
                            placeholder={t('chat_placeholder')}
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                        />
                        <div className="input-actions">
                            <button className="icon-btn" title={t('attach_file')}>
                                <Paperclip size={20} />
                            </button>
                            <button
                                className={`icon-btn send-btn ${chatInput.trim() ? 'active' : ''}`}
                                onClick={handleSendMessage}
                                disabled={!chatInput.trim()}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                    <p className="chat-disclaimer">
                        {t('chat_disclaimer')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
