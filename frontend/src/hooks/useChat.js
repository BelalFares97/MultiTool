import { useState } from 'react';
import useLocalStorage from './useLocalStorage';

export function useChat(language, t) {
    const [chatSessions, setChatSessions] = useLocalStorage('chatSessions', []);
    const [activeChatId, setActiveChatId] = useState(() => {
        const savedChats = localStorage.getItem('chatSessions');
        if (savedChats) {
            const parsed = JSON.parse(savedChats);
            return parsed.length > 0 ? parsed[0].id : null;
        }
        return null;
    });
    const [chatInput, setChatInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMsg = { id: Date.now(), role: 'user', content: chatInput };
        let currentChatId = activeChatId;
        let currentMessages = [];

        if (!currentChatId) {
            currentChatId = `chat-${Date.now()}`;
            currentMessages = [userMsg];
            const newSession = { id: currentChatId, title: chatInput.slice(0, 30) || t('new_chat'), date: 'Just now', messages: currentMessages };
            setChatSessions(prev => [newSession, ...prev]);
            setActiveChatId(currentChatId);
        } else {
            const session = chatSessions.find(c => c.id === currentChatId);
            currentMessages = [...(session?.messages || []), userMsg];
            setChatSessions(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: currentMessages } : c));
        }

        const queryText = chatInput;
        setChatInput('');
        setIsThinking(true);

        try {
            const history = currentMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
            const response = await fetch('http://localhost:5000/api/rafeeq/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: queryText, context: history })
            });

            if (!response.ok) throw new Error('Failed to fetch from assistant');
            const data = await response.json();
            const aiMsg = { id: Date.now() + 1, role: 'assistant', content: data.reply };
            setChatSessions(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: [...c.messages, aiMsg] } : c));
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMsg = { id: Date.now() + 1, role: 'assistant', content: 'Connection error. Please ensure the backend is running.' };
            setChatSessions(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: [...c.messages, errorMsg] } : c));
        } finally {
            setIsThinking(false);
        }
    };

    return {
        chatSessions, setChatSessions,
        activeChatId, setActiveChatId,
        chatInput, setChatInput,
        isThinking, handleSendMessage
    };
}
