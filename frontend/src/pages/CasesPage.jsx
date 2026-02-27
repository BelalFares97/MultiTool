import React, { useState } from 'react';
import CasesTable from '../components/CasesTable';

const CasesPage = ({
    cases,
    handleOpenCase,
    handleOpenRiskIntelligence,
    handleDeleteCase,
    language
}) => {
    const [filterRisk, setFilterRisk] = useState('All');
    const [filterIndustry, setFilterIndustry] = useState('All');
    const [filterRM, setFilterRM] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    const filteredCases = cases.filter(c => {
        return (filterRisk === 'All' || c.risk === filterRisk) &&
            (filterIndustry === 'All' || c.industry === filterIndustry) &&
            (filterRM === 'All' || c.rm.toLowerCase() === filterRM.toLowerCase()) &&
            (filterStatus === 'All' || c.status === filterStatus);
    });

    const uniqueIndustries = ['All', ...new Set(cases.map(c => c.industry))];
    const uniqueRMs = ['All', ...new Set(cases.map(c => c.rm))];

    return (
        <CasesTable
            filteredCases={filteredCases}
            filterRisk={filterRisk}
            setFilterRisk={setFilterRisk}
            filterIndustry={filterIndustry}
            setFilterIndustry={setFilterIndustry}
            filterRM={filterRM}
            setFilterRM={setFilterRM}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            uniqueIndustries={uniqueIndustries}
            uniqueRMs={uniqueRMs}
            handleOpenCase={handleOpenCase}
            handleOpenRiskIntelligence={handleOpenRiskIntelligence}
            handleDeleteCase={handleDeleteCase}
            language={language}
        />
    );
};

export default CasesPage;
