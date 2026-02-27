import React, { useState } from 'react';
import RmsAssistant from '../components/RmsAssistant';

const RmsAssistantPage = ({ selectedCase, handleUpdateCase, language }) => {
    const [activeScenario, setActiveScenario] = useState('overview');

    return (
        <RmsAssistant
            activeScenario={activeScenario}
            setActiveScenario={setActiveScenario}
            selectedCase={selectedCase}
            onUpdateCase={handleUpdateCase}
            language={language}
        />
    );
};

export default RmsAssistantPage;
