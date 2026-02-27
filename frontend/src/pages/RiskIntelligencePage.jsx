import React from 'react';
import RiskIntelligenceUnit from '../components/RiskIntelligenceUnit';

const RiskIntelligencePage = ({ selectedCase, language }) => {
    return (
        <RiskIntelligenceUnit
            selectedCase={selectedCase}
            language={language}
        />
    );
};

export default RiskIntelligencePage;
