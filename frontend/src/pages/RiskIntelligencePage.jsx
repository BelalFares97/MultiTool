import React from 'react';
import RiskIntelligenceUnit from '../components/RiskIntelligenceUnit';

const RiskIntelligencePage = ({
    selectedCase, language, riskTriggerCount, setIsRiskSimulating, clientName, clientLogo,
    formData, setFormData, predictionResult, setPredictionResult,
    aiAnalysis, setAiAnalysis, isAnalyzingAI, setIsAnalyzingAI
}) => {
    return (
        <RiskIntelligenceUnit
            selectedCase={selectedCase}
            language={language}
            riskTriggerCount={riskTriggerCount}
            setIsRiskSimulating={setIsRiskSimulating}
            clientName={clientName}
            clientLogo={clientLogo}
            formData={formData}
            setFormData={setFormData}
            predictionResult={predictionResult}
            setPredictionResult={setPredictionResult}
            aiAnalysis={aiAnalysis}
            setAiAnalysis={setAiAnalysis}
            isAnalyzingAI={isAnalyzingAI}
            setIsAnalyzingAI={setIsAnalyzingAI}
        />
    );
};

export default RiskIntelligencePage;
