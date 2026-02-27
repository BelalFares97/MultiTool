import { useState } from 'react';
import useLocalStorage from './useLocalStorage';
import { INITIAL_CASES } from '../data/initialData';

export function useCases(userName) {
    const [cases, setCases] = useLocalStorage('cases', INITIAL_CASES);
    const [selectedCase, setSelectedCase] = useState(null);

    const handleCreateCase = async (newCaseData) => {
        if (!newCaseData.client) return;

        const formData = new FormData();
        formData.append('client', newCaseData.client);
        formData.append('industry', newCaseData.industry);
        newCaseData.files.forEach(file => formData.append('files', file));

        try {
            const response = await fetch('http://localhost:5000/api/cases', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Server error');
            const result = await response.json();

            const maxId = cases.reduce((max, c) => {
                const num = parseInt(c.id.split('-')[1]);
                return num > max ? num : max;
            }, 1000);

            const newCase = {
                id: `CAS-${maxId + 1}`,
                client: newCaseData.client,
                industry: newCaseData.industry,
                risk: 'Low',
                ews: 0,
                updated: new Date().toISOString().split('T')[0],
                status: 'New',
                rm: userName,
                files: result.filesUploaded || [],
                folderPath: result.folderPath
            };

            setCases(prev => [newCase, ...prev]);
            return true;
        } catch (error) {
            console.error('Failed to create case:', error);
            return false;
        }
    };

    const handleCreateFinanceRequest = (financeData) => {
        const maxId = cases.reduce((max, c) => {
            const num = parseInt(c.id.split('-')[1]);
            return num > max ? num : max;
        }, 1000);

        const newCase = {
            id: `CAS-${maxId + 1}`,
            client: financeData.fullName,
            industry: financeData.industry,
            risk: financeData.creditScore > 700 ? 'Low' : financeData.creditScore > 550 ? 'Medium' : 'High',
            ews: financeData.dti > 0.5 ? 12 : 3,
            updated: new Date().toISOString().split('T')[0],
            status: 'New',
            rm: userName,
            files: [financeData.file.name],
            projectDetails: {
                projectName: financeData.purpose,
                projectLocation: financeData.property,
                value: `${financeData.requestedAmount.toLocaleString()} SAR`,
                duration: `${financeData.tenure} Years`,
                paymentTerms: `DTI: ${financeData.dti}, Monthly Salary: ${financeData.monthlySalary.toLocaleString()} SAR`,
                scopeOfWork: `Identity: ${financeData.identityType}, Nationality: ${financeData.nationality}, Employer: ${financeData.employer}, Status: ${financeData.employmentStatus}, Age: ${financeData.age}`
            },
            simulationValues: {
                credit_score: financeData.creditScore,
                monthly_salary_sar: financeData.monthlySalary,
                financing_amount_sar: financeData.requestedAmount,
                dti_ratio: parseFloat(financeData.dti),
                age: financeData.age,
                nationality_group: financeData.nationality,
                employment_type: financeData.employmentStatus.includes('Salaried') ? 'Private' : 'Self-employed',
                industry: financeData.industry
            }
        };

        setCases(prev => [newCase, ...prev]);
    };

    const handleDeleteCase = (caseId, t) => {
        if (window.confirm(t('delete_case_confirm'))) {
            setCases(prev => prev.filter(c => c.id !== caseId));
            if (selectedCase && selectedCase.id === caseId) setSelectedCase(null);
        }
    };

    const handleUpdateCase = (caseId, updates) => {
        setCases(prev => prev.map(c => c.id === caseId ? { ...c, ...updates, updated: new Date().toISOString().split('T')[0] } : c));
        if (selectedCase && selectedCase.id === caseId) {
            setSelectedCase(prev => ({ ...prev, ...updates }));
        }
    };

    const handleOpenCase = async (caseItem) => {
        setSelectedCase(caseItem);

        if (caseItem.folderPath && (!caseItem.projectDetails || Object.keys(caseItem.projectDetails).length === 0)) {
            try {
                const response = await fetch('http://localhost:5000/api/parse-contract', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ folderPath: caseItem.folderPath })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.details) {
                        const updatedCase = { ...caseItem, projectDetails: data.details };
                        setCases(prev => prev.map(c => c.id === caseItem.id ? updatedCase : c));
                        setSelectedCase(updatedCase);
                    }
                }
            } catch (error) {
                console.error('Error auto-parsing contract:', error);
            }
        }
    };

    return {
        cases, setCases,
        selectedCase, setSelectedCase,
        handleCreateCase,
        handleCreateFinanceRequest,
        handleDeleteCase,
        handleUpdateCase,
        handleOpenCase
    };
}
