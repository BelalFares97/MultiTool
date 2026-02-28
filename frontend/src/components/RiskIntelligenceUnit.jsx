import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles/RiskIntelligence.css';
import {
    Info, FileText, TrendingUp, ShieldAlert, Users, Briefcase, Zap,
    AlertCircle, User, CheckCircle, XCircle, Activity, CreditCard,
    Home, MapPin, ShieldCheck, Cpu, ArrowRight
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

const RiskIntelligenceUnit = ({
    selectedCase, language, riskTriggerCount, setIsRiskSimulating, clientName, clientLogo,
    formData, setFormData, predictionResult, setPredictionResult,
    aiAnalysis, setAiAnalysis, isAnalyzingAI, setIsAnalyzingAI
}) => {
    const t = getTranslation(language);
    const [activeTab, setActiveTab] = useState(selectedCase ? 'overview' : 'risk-model');
    const [isSimulating, setIsSimulating] = useState(false);

    useEffect(() => {
        if (selectedCase) {
            const details = selectedCase.projectDetails || {};
            setFormData(prev => ({
                ...prev,
                monthly_salary: 15000,
                financing_amount: details.value ? parseFloat(details.value.replace(/[^0-9.]/g, '')) : 2500000,
                current_city: details.projectLocation || 'Dubai',
                job_title: selectedCase.industry || 'Manager'
            }));
        }
    }, [selectedCase]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        const finalValue = (type === 'number' || type === 'range') ? parseFloat(value) : value;
        setFormData(prev => {
            const newState = { ...prev, [name]: finalValue };

            // Auto-calculate some factors
            if (name === 'financing_amount' || name === 'property_value') {
                const fav = name === 'financing_amount' ? finalValue : prev.financing_amount;
                const pv = name === 'property_value' ? finalValue : prev.property_value;
                if (pv > 0) newState.ltv_ratio = fav / pv;
            }

            // Auto-calculate Total Monthly Commitments
            const commitmentFields = ['total_monthly_loans', 'credit_card_payments', 'rent_payment', 'other_obligations'];
            if (commitmentFields.includes(name)) {
                newState.total_monthly_commitments =
                    (newState.total_monthly_loans || 0) +
                    (newState.credit_card_payments || 0) +
                    (newState.rent_payment || 0) +
                    (newState.other_obligations || 0);
            }

            if (name === 'total_monthly_commitments' || name === 'monthly_salary' || commitmentFields.includes(name)) {
                const tmc = newState.total_monthly_commitments;
                const ms = name === 'monthly_salary' ? finalValue : prev.monthly_salary;
                if (ms > 0) newState.dti_ratio = tmc / ms;
            }

            return newState;
        });
    };

    // Trigger simulation via Topbar
    useEffect(() => {
        if (riskTriggerCount > 0) {
            runSimulation();
        }
    }, [riskTriggerCount]);

    const runSimulation = async () => {
        setIsSimulating(true);
        setIsRiskSimulating?.(true);
        setPredictionResult(null);
        try {
            const response = await fetch('http://127.0.0.1:5001/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            const data = await response.json();
            if (data && data.length > 0) {
                setPredictionResult(data[0]);
                // Automatically trigger deep analysis with full context
                runDeepAnalysis({
                    formData,
                    caseContext: selectedCase ? {
                        clientName: selectedCase.client,
                        industry: selectedCase.industry,
                        details: selectedCase.projectDetails
                    } : null
                });
            }
        } catch (error) {
            console.error("Simulation failed:", error);
            setPredictionResult({
                decision: 'Review', confidence: 0.65, isFallback: true,
                all_probabilities: { 'Approved': 0.35, 'Review': 0.50, 'Rejected': 0.15 }
            });
        } finally {
            setIsSimulating(false);
            setIsRiskSimulating?.(false);
        }
    };

    const runDeepAnalysis = async (data) => {
        setIsAnalyzingAI(true);
        setAiAnalysis(null);
        try {
            const response = await fetch('http://127.0.0.1:5001/api/miqyas/deep-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.status === 'success') {
                setAiAnalysis(result);
            } else {
                setAiAnalysis({ status: 'error', message: result.message });
            }
        } catch (err) {
            console.error("AI Analysis failed:", err);
            setAiAnalysis({ status: 'error', message: 'Connection failed' });
        } finally {
            setIsAnalyzingAI(false);
        }
    };

    const tabs = [
        { id: 'overview', name: t('overview'), icon: <Info size={18} />, description: t('overview_tab_desc') },
        { id: 'request', name: t('the_request'), icon: <FileText size={18} />, description: t('request_tab_desc') },
        { id: 'risk-model', name: t('risk_model'), icon: <TrendingUp size={18} />, description: t('risk_model_tab_desc') }
    ];

    const details = selectedCase?.projectDetails || {};

    return (
        <div className="rms-assistant-page">
            <div className="rms-subheader">
                <div className="scenario-cards-container">
                    {tabs.map((tab) => (
                        <div key={tab.id} className={`scenario-card ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                            <div className="scenario-card-content">
                                <div className="scenario-icon">{tab.icon}</div>
                                <span className="scenario-name">{tab.name}</span>
                                <div className="info-trigger">
                                    <Info size={14} />
                                    <div className="info-tooltip">{tab.description}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="analysis-content">
                {activeTab === 'overview' && renderOverview(t, selectedCase, details, formData)}
                {activeTab === 'request' && renderRequest(t, formData)}
                {activeTab === 'risk-model' && renderRiskModel(t, formData, handleInputChange, setFormData, isSimulating, runSimulation, predictionResult, clientName, clientLogo, aiAnalysis, isAnalyzingAI)}
            </div>
        </div>
    );
};

function renderOverview(t, selectedCase, details, formData) {
    return (
        <div className="overview-container fade-in">
            <div className="overview-details-card">
                <div className="overview-section-group">
                    <div className="section-column">
                        <h4 className="section-title"><User size={14} /> {t('personal_info')}</h4>
                        <div className="info-row"><span className="info-label">{t('full_name')}</span><span className="info-value">{selectedCase?.client || t('guest_customer')}</span></div>
                        <div className="info-row"><span className="info-label">{t('nationality')}</span><span className="info-value">{formData.nationality_group}</span></div>
                        <div className="info-row"><span className="info-label">{t('age')}</span><span className="info-value">{formData.age} {t('years')}</span></div>
                        <div className="info-row"><span className="info-label">{t('identity_type')}</span><span className="info-value">{t('national_id')}</span></div>
                        <div className="info-row"><span className="info-label">{t('credit_score')}</span><span className="info-value">{formData.credit_score}</span></div>
                    </div>
                    <div className="section-column">
                        <h4 className="section-title"><Briefcase size={14} /> {t('job_details')}</h4>
                        <div className="info-row"><span className="info-label">{t('employer')}</span><span className="info-value">{selectedCase?.client ? `${selectedCase.client} Corp` : t('unknown_employer')}</span></div>
                        <div className="info-row"><span className="info-label">{t('industry')}</span><span className="info-value">{selectedCase?.industry || t('not_specified')}</span></div>
                        <div className="info-row"><span className="info-label">{t('employment_status')}</span><span className="info-value">{formData.employment_type}</span></div>
                        <div className="info-row"><span className="info-label">{t('monthly_salary')}</span><span className="info-value">{formData.monthly_salary.toLocaleString()} AED</span></div>
                    </div>
                    <div className="section-column">
                        <h4 className="section-title"><Zap size={14} /> {t('finance_request')}</h4>
                        <div className="info-row highlight"><span className="info-label">{t('requested_amount')}</span><span className="info-value">{formData.financing_amount.toLocaleString()} AED</span></div>
                        <div className="info-row"><span className="info-label">{t('tenure')}</span><span className="info-value">{formData.takaful_term_years * 12} {t('months')}</span></div>
                        <div className="info-row"><span className="info-label">{t('purpose')}</span><span className="info-value">{t('project_expansion')}</span></div>
                        <div className="info-row payment-terms-highlight"><span className="info-label">{t('dti_ratio')}</span><span className="info-value">{(formData.dti_ratio * 100).toFixed(1)}%</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function renderRequest(t, formData) {
    return (
        <div className="obligation-container fade-in">
            <div className="obligation-header-card">
                <div className="obligation-info">
                    <h3>{t('request_payload')}</h3>
                    <p>{t('request_payload_desc')}</p>
                </div>
            </div>
            <div className="obligation-results-card">
                <div className="markdown-content table-viewer">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {`| Field Name | Submitted Value | Validation Status |
| :--- | :--- | :--- |
| **Request ID** | REQ-8829-X | ✅ Verified |
| **Customer ID** | ${formData.customer_id} | ✅ Logged |
| **National ID** | ${formData.national_id} | ✅ Verified |
| **API Version** | V2.4.1 | ✅ Compatible |
| **KYC Check** | ${formData.verification_status === 'Passed' ? 'Completed' : 'Pending'} | ✅ ${formData.verification_status.toUpperCase()} |
| **AML Screening** | ${formData.fraud_flags === 0 ? 'Clear' : 'Warning'} | ✅ ${formData.fraud_flags === 0 ? 'PASSED' : 'FLAGGED'} |
| **Requested Value** | ${formData.financing_amount.toLocaleString()} AED | ${formData.ltv_ratio < 0.85 ? '✅ Within Limits' : '⚠️ Edge Case'} |
| **Credit Score** | ${formData.credit_score} | ${formData.credit_score > 600 ? '✅ Healthy' : '⚠️ Risk'} |
| **DTI Ratio** | ${(formData.dti_ratio * 100).toFixed(1)}% | ${formData.dti_ratio < 0.5 ? '✅ Optimal' : '❌ High'} |`}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

function renderRiskModel(t, formData, handleInputChange, setFormData, isSimulating, runSimulation, predictionResult, clientName, clientLogo, aiAnalysis, isAnalyzingAI) {
    return (
        <div className="risk-simulation-view fade-in">
            <div className="risk-model-grid">

                {/* Identification Section */}
                <div className="risk-input-section">
                    <div className="section-label-group"><ShieldCheck size={18} /><h4>{t('identification')}</h4></div>
                    <div className="risk-input-field"><label>{t('customer_id')}</label>
                        <input type="text" name="customer_id" value={formData.customer_id} onChange={handleInputChange} />
                    </div>
                    <div className="risk-input-field"><label>{t('national_id')}</label>
                        <input type="text" name="national_id" value={formData.national_id} onChange={handleInputChange} />
                    </div>
                </div>

                {/* Demographics Section */}
                <div className="risk-input-section">
                    <div className="section-label-group"><User size={18} /><h4>{t('demographics_stability')}</h4></div>
                    <div className="risk-input-field"><label>{t('nationality_group')}</label>
                        <select name="nationality_group" value={formData.nationality_group} onChange={handleInputChange}>
                            <option value="Emirati">Emirati</option><option value="GCC">GCC</option><option value="Expat">Expat</option>
                        </select>
                    </div>
                    <div className="risk-slider-container"><div className="slider-val-header"><label>{t('age')}</label><span>{formData.age}</span></div>
                        <input type="range" name="age" min="21" max="75" className="risk-model-slider" value={formData.age} onChange={handleInputChange} />
                    </div>
                    <div className="risk-input-field"><label>{t('gender')}</label>
                        <select name="gender" value={formData.gender} onChange={handleInputChange}>
                            <option value="Male">{t('male')}</option><option value="Female">{t('female')}</option>
                        </select>
                    </div>
                    <div className="risk-input-field"><label>{t('marital_status')}</label>
                        <select name="marital_status" value={formData.marital_status} onChange={handleInputChange}>
                            <option value="Single">Single</option><option value="Married">Married</option><option value="Divorced">Divorced</option><option value="Widowed">Widowed</option>
                        </select>
                    </div>
                    <div className="risk-slider-container"><div className="slider-val-header"><label>{t('dependents')}</label><span>{formData.dependents}</span></div>
                        <input type="range" name="dependents" min="0" max="10" className="risk-model-slider" value={formData.dependents} onChange={handleInputChange} />
                    </div>
                    <div className="risk-input-field"><label>{t('education_level')}</label>
                        <select name="education_level" value={formData.education_level} onChange={handleInputChange}>
                            <option value="High School">High School</option><option value="Diploma">Diploma</option><option value="Bachelor">Bachelor</option><option value="Master/PhD">Master/PhD</option>
                        </select>
                    </div>
                </div>

                {/* Employment Section */}
                <div className="risk-input-section">
                    <div className="section-label-group"><Briefcase size={18} /><h4>{t('employment_income')}</h4></div>
                    <div className="risk-input-field"><label>{t('employment_type')}</label>
                        <select name="employment_type" value={formData.employment_type} onChange={handleInputChange}>
                            <option value="Government">Government</option><option value="Semi-Government">Semi-Government</option><option value="Private">Private</option><option value="Self-Employed">Self-Employed</option>
                        </select>
                    </div>
                    <div className="risk-input-field"><label>{t('employer_sector')}</label>
                        <input type="text" name="employer_sector" value={formData.employer_sector} onChange={handleInputChange} />
                    </div>
                    <div className="risk-input-field"><label>{t('job_title')}</label>
                        <input type="text" name="job_title" value={formData.job_title} onChange={handleInputChange} />
                    </div>
                    <div className="risk-slider-container"><div className="slider-val-header"><label>{t('employment_years')}</label><span>{formData.employment_years}</span></div>
                        <input type="range" name="employment_years" min="0" max="45" className="risk-model-slider" value={formData.employment_years} onChange={handleInputChange} />
                    </div>
                    <div className="risk-input-field"><label>{t('monthly_salary')}</label>
                        <input type="number" name="monthly_salary" value={formData.monthly_salary} onChange={handleInputChange} />
                    </div>
                    <div className="risk-input-field"><label>{t('salary_payment_method')}</label>
                        <select name="salary_payment_method" value={formData.salary_payment_method} onChange={handleInputChange}>
                            <option value="Bank Transfer">{t('bank_transfer')}</option><option value="Cash">{t('cash')}</option><option value="Cheque">{t('cheque')}</option>
                        </select>
                    </div>
                    <div className="risk-slider-container"><div className="slider-val-header"><label>{t('income_stability')}</label><span>{formData.income_stability_score.toFixed(2)}</span></div>
                        <input type="range" name="income_stability_score" min="0" max="1" step="0.01" className="risk-model-slider" value={formData.income_stability_score} onChange={handleInputChange} />
                    </div>
                </div>

                {/* Financial Commitments Section */}
                <div className="risk-input-section">
                    <div className="section-label-group"><CreditCard size={18} /><h4>{t('financial_obligations')}</h4></div>
                    <div className="risk-slider-container"><div className="slider-val-header"><label>{t('monthly_loan_payments')}</label><span>{formData.total_monthly_loans.toLocaleString()} AED</span></div>
                        <input type="range" name="total_monthly_loans" min="0" max="50000" step="100" className="risk-model-slider" value={formData.total_monthly_loans} onChange={handleInputChange} />
                    </div>
                    <div className="risk-slider-container"><div className="slider-val-header"><label>{t('credit_card_payments')}</label><span>{formData.credit_card_payments.toLocaleString()} AED</span></div>
                        <input type="range" name="credit_card_payments" min="0" max="20000" step="50" className="risk-model-slider" value={formData.credit_card_payments} onChange={handleInputChange} />
                    </div>
                    <div className="risk-slider-container"><div className="slider-val-header"><label>{t('rent_payment')}</label><span>{formData.rent_payment.toLocaleString()} AED</span></div>
                        <input type="range" name="rent_payment" min="0" max="30000" step="100" className="risk-model-slider" value={formData.rent_payment} onChange={handleInputChange} />
                    </div>
                    <div className="risk-slider-container"><div className="slider-val-header"><label>{t('other_obligations')}</label><span>{formData.other_obligations.toLocaleString()} AED</span></div>
                        <input type="range" name="other_obligations" min="0" max="10000" step="50" className="risk-model-slider" value={formData.other_obligations} onChange={handleInputChange} />
                    </div>
                    <div className="risk-input-field"><label>{t('total_monthly_commitments')}</label>
                        <input type="number" name="total_monthly_commitments" value={formData.total_monthly_commitments} readOnly style={{ background: 'rgba(0,0,0,0.05)', cursor: 'not-allowed' }} />
                    </div>
                    <div className="risk-slider-container"><div className="slider-val-header"><label>{t('dti_ratio')}</label>
                        <span style={{ color: formData.dti_ratio > 0.45 ? 'var(--color-danger)' : 'var(--accent-color)' }}>{(formData.dti_ratio * 100).toFixed(0)}%</span></div>
                        <input type="range" name="dti_ratio" min="0" max="1" step="0.01" className="risk-model-slider" value={formData.dti_ratio} disabled style={{ cursor: 'not-allowed', opacity: 0.8 }} />
                    </div>
                </div>

                {/* Location & Residence Section */}
                <div className="risk-input-section">
                    <div className="section-label-group"><MapPin size={18} /><h4>{t('location_risk')}</h4></div>
                    <div className="risk-input-field"><label>{t('current_city')}</label>
                        <select name="current_city" value={formData.current_city} onChange={handleInputChange}>
                            <option value="Dubai">Dubai</option><option value="Abu Dhabi">Abu Dhabi</option><option value="Sharjah">Sharjah</option><option value="Ajman">Ajman</option><option value="Fujairah">Fujairah</option>
                        </select>
                    </div>
                    <div className="risk-input-field"><label>{t('area_risk_level')}</label>
                        <select name="area_risk_level" value={formData.area_risk_level} onChange={handleInputChange}>
                            <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                        </select>
                    </div>
                    <div className="risk-input-field"><label>{t('residence_type')}</label>
                        <select name="residence_type" value={formData.residence_type} onChange={handleInputChange}>
                            <option value="Owned">{t('owned')}</option><option value="Rented">{t('rented')}</option><option value="Mortgaged">{t('mortgaged')}</option>
                        </select>
                    </div>
                    <div className="risk-slider-container"><div className="slider-val-header"><label>{t('years_at_address')}</label><span>{formData.years_at_address}</span></div>
                        <input type="range" name="years_at_address" min="0" max="50" className="risk-model-slider" value={formData.years_at_address} onChange={handleInputChange} />
                    </div>
                </div>

                {/* Property & Financing Section */}
                <div className="risk-input-section">
                    <div className="section-label-group"><Home size={18} /><h4>{t('property_financing')}</h4></div>
                    <div className="risk-input-field"><label>{t('property_type')}</label>
                        <select name="property_type" value={formData.property_type} onChange={handleInputChange}>
                            <option value="Villa">Villa</option><option value="Apartment">Apartment</option><option value="Land">Land</option>
                        </select>
                    </div>
                    <div className="risk-input-field"><label>{t('project_status')}</label>
                        <select name="project_status" value={formData.project_status} onChange={handleInputChange}>
                            <option value="Ready">{t('ready')}</option><option value="Under Construction">{t('under_construction')}</option>
                        </select>
                    </div>
                    <div className="risk-input-field"><label>{t('property_value')}</label>
                        <input type="number" name="property_value" value={formData.property_value} onChange={handleInputChange} />
                    </div>
                    <div className="risk-input-field"><label>{t('down_payment')}</label>
                        <input type="number" name="down_payment" value={formData.down_payment} onChange={handleInputChange} />
                    </div>
                    <div className="risk-input-field"><label>{t('financing_amount')}</label>
                        <input type="number" name="financing_amount" value={formData.financing_amount} onChange={handleInputChange} />
                    </div>
                    <div className="risk-input-field"><label>{t('first_home_flag')}</label>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="radio" name="first_home_flag" value="1" checked={formData.first_home_flag === 1} onChange={() => setFormData(p => ({ ...p, first_home_flag: 1 }))} /> {t('yes')}
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="radio" name="first_home_flag" value="0" checked={formData.first_home_flag === 0} onChange={() => setFormData(p => ({ ...p, first_home_flag: 0 }))} /> {t('no')}
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {predictionResult && renderResults(t, predictionResult, formData, clientName, clientLogo)}


        </div>
    );
}

function renderResults(t, predictionResult, formData, clientName, clientLogo) {
    return (
        <div className="risk-results-panel">
            <div className="results-header-with-badge">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ShieldCheck size={24} color="var(--accent-color)" />
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('final_decision')}</h3>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('based_on_model')}</p>
                    </div>
                </div>
                <div className={`decision-badge ${predictionResult.decision}`}>
                    {t('system_decision')} {predictionResult.decision.toUpperCase()}
                    {predictionResult.isFallback && <span style={{ display: 'block', fontSize: '9px', opacity: 0.7 }}>{t('fallback_api')}</span>}
                </div>
            </div>

            <div className="results-summary-grid">
                <div className={`summary-card ${predictionResult.decision === 'Approved' ? 'success' : predictionResult.decision === 'Review' ? 'warning' : 'accent'}`}>
                    <div className="summary-label">{t('decision_confidence')}</div>
                    <div className={`summary-value ${predictionResult.decision === 'Approved' ? 'success' : predictionResult.decision === 'Review' ? 'warning' : 'accent'}`}>
                        {(predictionResult.confidence * 100).toFixed(1)}%
                    </div>
                </div>
                <div className="summary-card warning">
                    <div className="summary-label">{t('ews_prediction')}</div>
                    <div className="summary-value warning">{formData.missed_payments_12m > 0 ? 'HIGH' : 'LOW'}</div>
                </div>
                <div className="summary-card success">
                    <div className="summary-label">{t('acceptance_probability')}</div>
                    <div className="summary-value success">{(predictionResult.all_probabilities['Approved'] * 100).toFixed(1)}%</div>
                </div>
            </div>

            <div className="probability-bars-container">
                <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <TrendingUp size={16} /> {t('model_probability')}
                </h4>
                {Object.entries(predictionResult.all_probabilities).map(([label, prob]) => (
                    <div className="prob-bar-group" key={label}>
                        <div className="prob-label-row"><span style={{ fontSize: '0.8rem' }}>{label}</span><span style={{ fontSize: '0.8rem' }}>{(prob * 100).toFixed(2)}%</span></div>
                        <div className="prob-bar-bg"><div className={`prob-bar-fill ${label}`} style={{ width: `${prob * 100}%` }}></div></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RiskIntelligenceUnit;
