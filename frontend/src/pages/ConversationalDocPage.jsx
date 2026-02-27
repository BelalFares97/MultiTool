import React from 'react';
import ChatInterface from '../components/ChatInterface';

const ConversationalDocPage = ({
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
    return (
        <ChatInterface
            chatSessions={chatSessions}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
            setChatSessions={setChatSessions}
            chatInput={chatInput}
            setChatInput={setChatInput}
            handleSendMessage={handleSendMessage}
            isThinking={isThinking}
            clientLogo={clientLogo}
            userImage={userImage}
            language={language}
        />
    );
};

export default ConversationalDocPage;
