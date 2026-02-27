import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Info,
    AlertCircle,
    TrendingUp,
    ShieldCheck,
    Zap,
    FileText,
    Users,
    Briefcase,
    MapPin,
    CreditCard,
    Clock,
    Layers,
    Calendar
} from 'lucide-react';

const RmsAssistant = ({ activeScenario, setActiveScenario, selectedCase, onUpdateCase }) => {
    const scenarios = [
        {
            id: 'overview',
            name: 'Overview',
            icon: <Info size={18} />,
            description: 'Show contract main details'
        },
        {
            id: 'cashflow',
            name: 'Contract–Cashflow',
            icon: <TrendingUp size={18} />,
            description: 'Analyzes whether the project cashflow assumptions are consistent with contract terms and annexed conditions, including payment terms and milestones.'
        },
        {
            id: 'obligation',
            name: 'Contract Obligation',
            icon: <AlertCircle size={18} />,
            description: 'Extracts and structures key contractual obligations, guarantees, and covenant-like triggers from the contract and annex.'
        }
    ];

    // State for Cashflow Analysis
    const [analysisResults, setAnalysisResults] = React.useState({});
    const [indicatorColors, setIndicatorColors] = React.useState({});
    const [loadingStates, setLoadingStates] = React.useState({});
    const [activeCheck, setActiveCheck] = React.useState(null);

    // State for Contract Obligations
    const [obligationResult, setObligationResult] = React.useState(null);
    const [isObligationLoading, setIsObligationLoading] = React.useState(false);

    const cashflowChecks = [
        {
            id: 'value_consistency',
            name: 'Value Consistency Check',
            icon: <ShieldCheck size={16} />,
            query: "from contract vs analysis file return Value Consistency Check results",
            systemPrompt: "You are a specialized Value Consistency Check analyst. STRICT RESPONSE FORMAT & STRUCTURE RULES (MANDATORY): NEVER use the # symbol in your response. Titles and section headers MUST be written using BOLD TEXT IN ALL CAPS only. DO NOT start your response with a title or repeat the check name. Responses MUST be clearly structured using Markdown formatting. Use bullet points or numbered lists whenever listing items, steps, rules, conditions, or features. Avoid long unbroken paragraphs and prefer short, clear sentences aligned with banking documentation standards. IMPORTANT: Your response MUST conclude with a status line in the format 'STATUS: [COLOR]' where [COLOR] is either GREEN, YELLOW, or RED based on the risk assessment (Green for low risk/consistent, Yellow for medium risk/special attention, Red for high risk/inconsistent)."
        },
        {
            id: 'payment_timing',
            name: 'Payment Timing Check',
            icon: <Clock size={16} />,
            query: "from contract vs analysis file return Payment Timing Check results",
            systemPrompt: "You are a specialized Payment Timing Check auditor. STRICT RESPONSE FORMAT & STRUCTURE RULES (MANDATORY): NEVER use the # symbol in your response. Titles and section headers MUST be written using BOLD TEXT IN ALL CAPS only. DO NOT start your response with a title or repeat the check name. Responses MUST be clearly structured using Markdown formatting. Use bullet points or numbered lists whenever listing items, steps, rules, conditions, or features. Avoid long unbroken paragraphs and prefer short, clear sentences aligned with banking documentation standards. IMPORTANT: Your response MUST conclude with a status line in the format 'STATUS: [COLOR]' where [COLOR] is either GREEN, YELLOW, or RED based on the risk assessment (Green for low risk/consistent, Yellow for medium risk/special attention, Red for high risk/inconsistent)."
        },
        {
            id: 'peak_deficit',
            name: 'Peak Deficit Check',
            icon: <TrendingUp size={16} />,
            query: "from contract vs analysis file return Peak Deficit Check results",
            systemPrompt: "You are a specialized Peak Deficit Check expert. STRICT RESPONSE FORMAT & STRUCTURE RULES (MANDATORY): NEVER use the # symbol in your response. Titles and section headers MUST be written using BOLD TEXT IN ALL CAPS only. DO NOT start your response with a title or repeat the check name. Responses MUST be clearly structured using Markdown formatting. Use bullet points or numbered lists whenever listing items, steps, rules, conditions, or features. Avoid long unbroken paragraphs and prefer short, clear sentences aligned with banking documentation standards. IMPORTANT: Your response MUST conclude with a status line in the format 'STATUS: [COLOR]' where [COLOR] is either GREEN, YELLOW, or RED based on the risk assessment (Green for low risk/consistent, Yellow for medium risk/special attention, Red for high risk/inconsistent)."
        },
        {
            id: 'cost_vs_inflow',
            name: 'Cost Loading vs Inflow Check',
            icon: <Layers size={16} />,
            query: "from contract vs analysis file return Cost Loading vs Inflow Check results",
            systemPrompt: "You are a specialized Cost Loading vs Inflow Check financier. STRICT RESPONSE FORMAT & STRUCTURE RULES (MANDATORY): NEVER use the # symbol in your response. Titles and section headers MUST be written using BOLD TEXT IN ALL CAPS only. DO NOT start your response with a title or repeat the check name. Responses MUST be clearly structured using Markdown formatting. Use bullet points or numbered lists whenever listing items, steps, rules, conditions, or features. Avoid long unbroken paragraphs and prefer short, clear sentences aligned with banking documentation standards. IMPORTANT: Your response MUST conclude with a status line in the format 'STATUS: [COLOR]' where [COLOR] is either GREEN, YELLOW, or RED based on the risk assessment (Green for low risk/consistent, Yellow for medium risk/special attention, Red for high risk/inconsistent)."
        },
        {
            id: 'risky_assumptions',
            name: 'Risky Assumptions Check',
            icon: <AlertCircle size={16} />,
            query: "return Risky Assumptions Check results based on contract analysis",
            systemPrompt: "You are a specialized Risky Assumptions Check consultant. STRICT RESPONSE FORMAT & STRUCTURE RULES (MANDATORY): NEVER use the # symbol in your response. Titles and section headers MUST be written using BOLD TEXT IN ALL CAPS only. DO NOT start your response with a title or repeat the check name. Responses MUST be clearly structured using Markdown formatting. Use bullet points or numbered lists whenever listing items, steps, rules, conditions, or features. Avoid long unbroken paragraphs and prefer short, clear sentences aligned with banking documentation standards. IMPORTANT: Your response MUST conclude with a status line in the format 'STATUS: [COLOR]' where [COLOR] is either GREEN, YELLOW, or RED based on the risk assessment (Green for low risk/consistent, Yellow for medium risk/special attention, Red for high risk/inconsistent)."
        },
        {
            id: 'risk_visibility',
            name: 'Risk Visibility Assessment',
            icon: <Zap size={16} />,
            query: "from contract vs analysis file return Risk Visibility Assessment results",
            systemPrompt: "You are a specialized Risk Visibility Assessment member. STRICT RESPONSE FORMAT & STRUCTURE RULES (MANDATORY): NEVER use the # symbol in your response. Titles and section headers MUST be written using BOLD TEXT IN ALL CAPS only. DO NOT start your response with a title or repeat the check name. Responses MUST be clearly structured using Markdown formatting. Use bullet points or numbered lists whenever listing items, steps, rules, conditions, or features. Avoid long unbroken paragraphs and prefer short, clear sentences aligned with banking documentation standards. IMPORTANT: Your response MUST conclude with a status line in the format 'STATUS: [COLOR]' where [COLOR] is either GREEN, YELLOW, or RED based on the risk assessment (Green for low risk/consistent, Yellow for medium risk/special attention, Red for high risk/inconsistent)."
        }
    ];

    const runAnalysis = async (check) => {
        setActiveCheck(check.id);
        setLoadingStates(prev => ({ ...prev, [check.id]: true }));

        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: check.query,
                    history: [{ role: 'system', content: check.systemPrompt }]
                })
            });

            if (!response.ok) throw new Error('Failed to fetch analysis');
            const data = await response.json();
            const resultText = data.response;

            setAnalysisResults(prev => ({ ...prev, [check.id]: resultText }));

            // Parse color from response
            const colorMatch = resultText.match(/STATUS:\s*(GREEN|YELLOW|RED)/i);
            if (colorMatch) {
                setIndicatorColors(prev => ({ ...prev, [check.id]: colorMatch[1].toLowerCase() }));
            }
        } catch (error) {
            console.error('Analysis Error:', error);
            setAnalysisResults(prev => ({ ...prev, [check.id]: "Error: Could not retrieve analysis. Please ensure the backend is running." }));
        } finally {
            setLoadingStates(prev => ({ ...prev, [check.id]: false }));
        }
    };

    const handleFetchObligations = async () => {
        setIsObligationLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: "From contract financing document, extract and present financing facilities in a structured table with the following columns: 1- Facility Type. 2- Percentage (%). 3- Amount (SAR). 4- Linked To (Contract / Receivables / Procurement). 5-Trigger / Dependency - Validity / Duration - Purpose. Facilities to look for: - Advance Payment Guarantee - Performance Bond - Letters of Credit (LC) - LCR / Receivables Financing If any field is missing, clearly state \"Not specified\".",
                    history: [{
                        role: 'system',
                        content: `You are a credit and contract analysis expert.
Your task is to extract financing facilities from contract annexes or credit documents and normalize them into a structured table.

Rules:
- Only extract information explicitly stated in the document.
- Always link percentages to the contract value if available.
- Output must be a single table in markdown format.`
                    }]
                })
            });

            if (!response.ok) throw new Error('Failed to fetch obligations');
            const data = await response.json();
            setObligationResult(data.response);
        } catch (error) {
            console.error('Obligation Fetch Error:', error);
            setObligationResult("Error: Could not retrieve obligations. Please ensure the backend is running.");
        } finally {
            setIsObligationLoading(false);
        }
    };

    React.useEffect(() => {
        if (!activeScenario) {
            setActiveScenario('overview');
        }
    }, [activeScenario, setActiveScenario]);

    if (!selectedCase) {
        return (
            <div className="no-case-state fade-in">
                <div className="empty-state-icon">
                    <AlertCircle size={48} />
                </div>
                <h2>No Case Selected</h2>
                <p>Please select a case from the Cases list to view analysis details.</p>
            </div>
        );
    }

    const details = selectedCase.projectDetails || {};

    const handleStatusChange = (e) => {
        onUpdateCase(selectedCase.id, { status: e.target.value });
    };

    const handleRiskChange = (e) => {
        onUpdateCase(selectedCase.id, { risk: e.target.value });
    };

    return (
        <div className="rms-assistant-page">
            <div className="rms-subheader">
                <div className="scenario-cards-container">
                    {scenarios.map((scenario) => (
                        <div
                            key={scenario.id}
                            className={`scenario-card ${activeScenario === scenario.id ? 'active' : ''}`}
                            onClick={() => setActiveScenario(scenario.id)}
                        >
                            <div className="scenario-card-content">
                                <div className="scenario-icon">{scenario.icon}</div>
                                <span className="scenario-name">{scenario.name}</span>
                                <div className="info-trigger">
                                    <Info size={14} />
                                    <div className="info-tooltip">{scenario.description}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="analysis-content">
                {activeScenario === 'overview' && (
                    <div className="overview-container fade-in">
                        <div className="overview-header-card">
                            <div className="overview-main-title">
                                <span className="badge-id">{selectedCase.id}</span>
                                <h2>{details.projectName || selectedCase.client}</h2>
                            </div>

                            <div className="header-actions">
                                <div className="editable-status">
                                    <label>Status</label>
                                    <select value={selectedCase.status} onChange={handleStatusChange} className={`status-select status-${selectedCase.status.toLowerCase().replace(' ', '')}`}>
                                        <option value="New">New</option>
                                        <option value="Under Review">Under Review</option>
                                        <option value="Actioned">Actioned</option>
                                    </select>
                                </div>
                                <div className="editable-risk">
                                    <label>Risk Level</label>
                                    <select value={selectedCase.risk} onChange={handleRiskChange} className={`risk-select risk-${selectedCase.risk.toLowerCase()}`}>
                                        <option value="Low">Low Risk</option>
                                        <option value="Medium">Medium Risk</option>
                                        <option value="High">High Risk</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="overview-details-card">
                            <div className="overview-section-group">
                                <div className="section-column">
                                    <h4 className="section-title"><Users size={14} /> Project Identity</h4>
                                    <div className="info-row">
                                        <span className="info-label">Owner</span>
                                        <span className="info-value">{details.projectOwner || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Main Contractor</span>
                                        <span className="info-value">{details.mainContractor || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Sub-Contractor</span>
                                        <span className="info-value">{details.subContractor || 'N/A'}</span>
                                    </div>
                                    <div className="info-row vertical">
                                        <span className="info-label">Project Description</span>
                                        <span className="info-value">{details.projectDescription || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="section-column">
                                    <h4 className="section-title"><MapPin size={14} /> Logistics & Scope</h4>
                                    <div className="info-row">
                                        <span className="info-label">Location</span>
                                        <span className="info-value">{details.projectLocation || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Duration</span>
                                        <span className="info-value">{details.duration || 'N/A'}</span>
                                    </div>
                                    <div className="info-row vertical">
                                        <span className="info-label">Scope of Work</span>
                                        <span className="info-value">{details.scopeOfWork || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="section-column">
                                    <h4 className="section-title"><CreditCard size={14} /> Financials & Schedule</h4>
                                    <div className="info-row highlight">
                                        <span className="info-label">Project Value</span>
                                        <span className="info-value">{details.value || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Starting Date</span>
                                        <span className="info-value">{details.startingDate || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Completion Date</span>
                                        <span className="info-value">{details.completionDate || 'N/A'}</span>
                                    </div>
                                    <div className="info-row vertical payment-terms-highlight">
                                        <span className="info-label"><Zap size={14} /> Payment Terms</span>
                                        <span className="info-value">{details.paymentTerms || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeScenario === 'cashflow' && (
                    <div className="cashflow-analysis-view fade-in">
                        <div className="analysis-sidebar">
                            <h3 className="sidebar-title">Indicators & Checks</h3>
                            <div className="checks-list">
                                {cashflowChecks.map((check) => (
                                    <div
                                        key={check.id}
                                        className={`analysis-check-card ${activeCheck === check.id ? 'active' : ''} ${indicatorColors[check.id] ? `indicator-${indicatorColors[check.id]}` : ''}`}
                                        onClick={() => setActiveCheck(check.id)}
                                    >
                                        <div className="check-card-info">
                                            <div className="check-icon">{check.icon}</div>
                                            <span className="check-name">{check.name}</span>
                                        </div>
                                        <button
                                            className={`analysis-trigger-btn ${loadingStates[check.id] ? 'loading' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); runAnalysis(check); }}
                                            disabled={loadingStates[check.id]}
                                        >
                                            {loadingStates[check.id] ? <Zap className="spinning" size={14} /> : 'Analyze'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="analysis-results-area">
                            {!activeCheck ? (
                                <div className="results-empty-state">
                                    <Zap size={40} />
                                    <p>Select a check from the left to view detailed results.</p>
                                </div>
                            ) : (
                                <div className="results-display fade-in">
                                    <div className="results-header">
                                        <h3>{cashflowChecks.find(c => c.id === activeCheck)?.name}</h3>
                                        {loadingStates[activeCheck] && <span className="processing-badge"><Zap className="spinning" size={12} /> AI Processing...</span>}
                                    </div>
                                    <div className="results-content markdown-content">
                                        {loadingStates[activeCheck] ? (
                                            <div className="loading-placeholder">
                                                <div className="shimmer-line"></div>
                                                <div className="shimmer-line w-75"></div>
                                                <div className="shimmer-line w-50"></div>
                                            </div>
                                        ) : (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {analysisResults[activeCheck] || "No analysis available yet. Click 'Analyze' to begin."}
                                            </ReactMarkdown>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeScenario === 'obligation' && (
                    <div className="obligation-container fade-in">
                        <div className="obligation-header-card">
                            <div className="obligation-info">
                                <h3>Contract Obligations & Facilities</h3>
                                <p>Structured extraction of guarantees, credit facilities, and financial triggers.</p>
                            </div>
                            <button
                                className={`fetch-obligations-btn ${isObligationLoading ? 'loading' : ''}`}
                                onClick={handleFetchObligations}
                                disabled={isObligationLoading}
                            >
                                {isObligationLoading ? <Zap className="spinning" size={18} /> : <Zap size={18} />}
                                {isObligationLoading ? 'Analyzing Contract...' : 'Fetch Obligations'}
                            </button>
                        </div>

                        <div className="obligation-results-card">
                            {!obligationResult && !isObligationLoading ? (
                                <div className="results-empty-state">
                                    <FileText size={48} />
                                    <h3>No Obligations Fetched</h3>
                                    <p>Click "Fetch Obligations" to extract financial details from the contract documents.</p>
                                </div>
                            ) : isObligationLoading ? (
                                <div className="loading-placeholder">
                                    <div className="shimmer-line"></div>
                                    <div className="shimmer-line w-75"></div>
                                    <div className="shimmer-line w-50"></div>
                                    <div className="shimmer-line"></div>
                                </div>
                            ) : (
                                <div className="markdown-content table-viewer fade-in">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {obligationResult}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeScenario && activeScenario !== 'overview' && activeScenario !== 'cashflow' && activeScenario !== 'obligation' && (
                    <div className="empty-block fade-in">
                        Analysis module for <strong>{scenarios.find(s => s.id === activeScenario)?.name}</strong> is coming soon.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RmsAssistant;
