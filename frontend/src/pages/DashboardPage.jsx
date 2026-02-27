import React from 'react';
import Dashboard from '../components/Dashboard';

const DashboardPage = ({ language, clientName, setActivePage, cases }) => {
    const uniqueRMs = ['All', ...new Set(cases.map(c => c.rm))];

    return (
        <Dashboard
            language={language}
            clientName={clientName}
            setActivePage={setActivePage}
            cases={cases}
            uniqueRMs={uniqueRMs}
        />
    );
};

export default DashboardPage;
