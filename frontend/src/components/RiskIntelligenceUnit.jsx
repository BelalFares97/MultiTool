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

const RiskIntelligenceUnit = ({ selectedCase, language }) => {
    const t = getTranslation(language);
    const [activeTab, setActiveTab] = useState('overview');
    const [isSimulating, setIsSimulating] = useState(false);
    const [predictionResult, setPredictionResult] = useState(null);

    const [formData, setFormData] = useState({
        nationality_group: 'Saudi', age: 35, gender: 'Male', marital_status: 'Married',
        dependents: 2, education_level: 'Bachelor', employment_type: 'Private',
        employer_sector: 'Technology', job_title: 'Manager', employment_years: 5,
        monthly_salary_sar: 25000, salary_payment_method: 'Bank Transfer',
        income_stability_score: 0.85, total_monthly_loans_sar: 2000,
        credit_card_payments_sar: 500, rent_payment_sar: 3000, other_obligations_sar: 0,
        total_monthly_commitments_sar: 5500, dti_ratio: 0.22, current_city: 'Riyadh',
        area_risk_level: 'Low', residence_type: 'Owned', years_at_address: 4,
        property_type: 'Villa', project_status: 'Ready', first_home_flag: 1,
        property_value_sar: 1500000, down_payment_sar: 300000,
        financing_amount_sar: 1200000, ltv_ratio: 0.8, credit_score: 720,
        missed_payments_12m: 0, bounce_cheques_12m: 0, default_history_flag: 0,
        account_age_years: 10, utilization_ratio: 0.15, takaful_status: 'Active',
        takaful_provider: 'Tawuniya', takaful_coverage_sar: 1200000,
        takaful_term_years: 20, takaful_premium_sar: 1500,
        application_channel: 'Web', docs_completeness: 1.0,
        verification_status: 'Passed', fraud_flags: 0
    });

    useEffect(() => {
        if (selectedCase) {
            const details = selectedCase.projectDetails || {};
            setFormData(prev => ({
                ...prev,
                monthly_salary_sar: 45000,
                financing_amount_sar: details.value ? parseFloat(details.value.replace(/[^0-9.]/g, '')) : 2500000,
                current_city: details.projectLocation || 'Riyadh',
                industry: selectedCase.industry || 'Technology'
            }));
        }
    }, [selectedCase]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        const finalValue = (type === 'number' || type === 'range') ? parseFloat(value) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const runSimulation = async () => {
        setIsSimulating(true);
        setPredictionResult(null);
        try {
            const response = await fetch('http://127.0.0.1:5001/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            const data = await response.json();
            if (data && data.length > 0) setPredictionResult(data[0]);
        } catch (error) {
            console.error("Simulation failed:", error);
            setPredictionResult({
                decision: 'Review', confidence: 0.65, isFallback: true,
                all_probabilities: { 'Approved': 0.35, 'Review': 0.50, 'Rejected': 0.15 }
            });
        } finally {
            setIsSimulating(false);
        }
    };

    const tabs = [
        { id: 'overview', name: t('overview'), icon: <Info size={18} />, description: t('overview_tab_desc') },
        { id: 'request', name: t('the_request'), icon: <FileText size={18} />, description: t('request_tab_desc') },
        { id: 'risk-model', name: t('risk_model'), icon: <TrendingUp size={18} />, description: t('risk_model_tab_desc') }
    ];

    if (!selectedCase) {
        return (
            <div className="no-case-state fade-in">
                <div className="empty-state-icon"><AlertCircle size={48} /></div>
                <h2>{t('no_case_selected')}</h2>
                <p>{t('select_case_risk')}</p>
            </div>
        );
    }

    const details = selectedCase.projectDetails || {};

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
                {activeTab === 'risk-model' && renderRiskModel(t, formData, handleInputChange, setFormData, isSimulating, runSimulation, predictionResult)}
            </div>
        </div>
    );
};

function renderOverview(t, selectedCase, details, formData) {
    return (
        <div className="overview-container fade-in">
            <div className="overview-header-card">
                <div className="overview-main-title">
                    <span className="badge-id">{selectedCase.id}</span>
                    <h2>{details.projectName || selectedCase.client} - {t('intelligence_overview')}</h2>
                </div>
            </div>
            <div className="overview-details-card">
                <div className="overview-section-group">
                    <div className="section-column">
                        <h4 className="section-title"><User size={14} /> {t('personal_info')}</h4>
                        <div className="info-row"><span className="info-label">{t('full_name')}</span><span className="info-value">{selectedCase.client}</span></div>
                        <div className="info-row"><span className="info-label">{t('nationality')}</span><span className="info-value">{formData.nationality_group}</span></div>
                        <div className="info-row"><span className="info-label">{t('age')}</span><span className="info-value">{formData.age} {t('years')}</span></div>
                        <div className="info-row"><span className="info-label">{t('identity_type')}</span><span className="info-value">{t('national_id')}</span></div>
                        <div className="info-row"><span className="info-label">{t('credit_score')}</span><span className="info-value">{formData.credit_score}</span></div>
                    </div>
                    <div className="section-column">
                        <h4 className="section-title"><Briefcase size={14} /> {t('job_details')}</h4>
                        <div className="info-row"><span className="info-label">{t('employer')}</span><span className="info-value">{selectedCase.client} Corp</span></div>
                        <div className="info-row"><span className="info-label">{t('industry')}</span><span className="info-value">{selectedCase.industry}</span></div>
                        <div className="info-row"><span className="info-label">{t('employment_status')}</span><span className="info-value">{formData.employment_type}</span></div>
                        <div className="info-row"><span className="info-label">{t('monthly_salary')}</span><span className="info-value">{formData.monthly_salary_sar.toLocaleString()} SAR</span></div>
                    </div>
                    <div className="section-column">
                        <h4 className="section-title"><Zap size={14} /> {t('finance_request')}</h4>
                        <div className="info-row highlight"><span className="info-label">{t('requested_amount')}</span><span className="info-value">{formData.financing_amount_sar.toLocaleString()} SAR</span></div>
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
| **Timestamp** | 2026-02-01 16:45:12 | ✅ Logged |
| **API Version** | V2.4.1 | ✅ Compatible |
| **Client Source** | Web Portal (Direct) | ✅ Secure |
| **KYC Check** | ${formData.verification_status === 'Passed' ? 'Completed' : 'Pending'} | ✅ ${formData.verification_status.toUpperCase()} |
| **AML Screening** | ${formData.fraud_flags === 0 ? 'Clear' : 'Warning'} | ✅ ${formData.fraud_flags === 0 ? 'PASSED' : 'FLAGGED'} |
| **Document Hashes** | MATCHED | ✅ Verified |
| **Requested Value** | ${formData.financing_amount_sar.toLocaleString()} SAR | ${formData.ltv_ratio < 0.85 ? '✅ Within Limits' : '⚠️ Edge Case'} |
| **Repayment Source** | Project Cashflows | ⚠️ Under Review |`}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

function renderRiskModel(t, formData, handleInputChange, setFormData, isSimulating, runSimulation, predictionResult) {
    return (
        <div className="risk-simulation-view fade-in">
            <div className="risk-model-grid">
                {/* Demographics */}
                <div className="risk-input-section">
                    <div className="section-label-group"><User size={18} /><h4>{t('demographics_stability')}</h4></div>
                    <div className="risk-input-field"><label>{t('nationality_group')}</label>
                        <select name="nationality_group" value={formData.nationality_group} onChange={handleInputChange}>
                            <option value="Saudi">Saudi</option><option value="GCC">GCC</option><option value="Expat">Expat</option>
                        </select>
                    </div>
                    <div className="risk-slider-container"><div className="slider-val-header"><label>{t('age')}</label><span>{formData.age}</span></div>
                        <input type="range" name="age" min="21" max="70" className="risk-model-slider" value={formData.age} onChange={handleInputChange} />
                    </div>
                    <div className="risk-input-field"><label>{t('marital_status')}</label>
                        <select name="marital_status" value={formData.marital_status} onChange={handleInputChange}>
                            <option value="Single">Single</option><option value="Married">Married</option><option value="Divorced">Divorced</option><option value="Widowed">Widowed</option>
                        </select>
                    </div>
                    <div className="risk-input-field"><label>{t('education_level')}</label>
                        <select name="education_level" value={formData.education_level} onChange={handleInputChange}>
                            <option value="High School">High School</option><option value="Diploma">Diploma</option><option value="Bachelor">Bachelor</option><option value="Master/PhD">Master/PhD</option>
                        </select>
                    </div>
                </div>

                {/* Employment */}
                <div className="risk-input-section">
                    <div className="section-label-group"><Briefcase size={18} /><h4>{t('employment_income')}</h4></div>
                    <div className="risk-input-field"><label>{t('employment_type')}</label>
                        <select name="employment_type" value={formData.employment_type} onChange={handleInputChange}>
                            <option value="Government">Government</option><option value="Semi-Government">Semi-Government</option><option value="Private">Private</option><option value="Self-Employed">Self-Employed</option>
                        </select>
                    </div>
                    <div className="risk-input-field"><label>{t('monthly_salary_sar')}</label>
                        <input type="number" name="monthly_salary_sar" value={formData.monthly_salary_sar} onChange={handleInputChange} />
                    </div>
                    <div className="risk-slider-container"><div className="slider-val-header"><label>{t('employment_years')}</label><span>{formData.employment_years}</span></div>
                        <input type="range" name="employment_years" min="0" max="40" className="risk-model-slider" value={formData.employment_years} onChange={handleInputChange} />
                    </div>
                    <div className="risk-slider-container"><div className="slider-val-header"><label>{t('income_stability')}</label><span>{formData.income_stability_score.toFixed(2)}</span></div>
                        <input type="range" name="income_stability_score" min="0" max="1" step="0.01" className="risk-model-slider" value={formData.income_stability_score} onChange={handleInputChange} />
                    </div>
                </div>

                {/* Credit Behavior */}
                <div className="risk-input-section">
                    <div className="section-label-group" style={{ color: 'var(--accent-color)' }}><Activity size={18} /><h4>{t('credit_behavior')}</h4></div>
                    <div className="risk-slider-container"><div className="slider-val-header"><label>{t('credit_score_simah')}</label>
                        <span style={{ fontSize: '1.1rem', color: formData.credit_score > 700 ? 'var(--color-success)' : 'var(--color-warning)' }}>{formData.credit_score}</span></div>
                        <input type="range" name="credit_score" min="300" max="900" className="risk-model-slider" value={formData.credit_score} onChange={handleInputChange} />
                    </div>
                    <div className="risk-input-field"><label>{t('missed_payments')}</label>
                        <input type="number" name="missed_payments_12m" value={formData.missed_payments_12m} onChange={handleInputChange} />
                    </div>
                    <div className="risk-input-field"><label>{t('bounce_cheques')}</label>
                        <input type="number" name="bounce_cheques_12m" value={formData.bounce_cheques_12m} onChange={handleInputChange} />
                    </div>
                    <div className="risk-slider-container"><div className="slider-val-header"><label>{t('utilization_ratio')}</label><span>{(formData.utilization_ratio * 100).toFixed(0)}%</span></div>
                        <input type="range" name="utilization_ratio" min="0" max="1" step="0.01" className="risk-model-slider" value={formData.utilization_ratio} onChange={handleInputChange} />
                    </div>
                </div>

                {/* Property */}
                <div className="risk-input-section">
                    <div className="section-label-group"><Home size={18} /><h4>{t('property_financing')}</h4></div>
                    <div className="risk-input-field"><label>{t('property_type')}</label>
                        <select name="property_type" value={formData.property_type} onChange={handleInputChange}>
                            <option value="Villa">Villa</option><option value="Apartment">Apartment</option><option value="Land">Land</option>
                        </select>
                    </div>
                    <div className="risk-input-field"><label>{t('property_value')}</label>
                        <input type="number" name="property_value_sar" value={formData.property_value_sar} onChange={handleInputChange} />
                    </div>
                    <div className="risk-slider-container"><div className="slider-val-header"><label>{t('ltv_ratio')}</label><span>{(formData.ltv_ratio * 100).toFixed(0)}%</span></div>
                        <input type="range" name="ltv_ratio" min="0" max="1" step="0.01" className="risk-model-slider" value={formData.ltv_ratio} onChange={handleInputChange} />
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

                {/* Financial Obligations */}
                <div className="risk-input-section">
                    <div className="section-label-group"><CreditCard size={18} /><h4>{t('financial_obligations')}</h4></div>
                    <div className="risk-input-field"><label>{t('monthly_loan_payments')}</label>
                        <input type="number" name="total_monthly_loans_sar" value={formData.total_monthly_loans_sar} onChange={handleInputChange} />
                    </div>
                    <div className="risk-slider-container"><div className="slider-val-header"><label>{t('dti_ratio')}</label>
                        <span style={{ color: formData.dti_ratio > 0.45 ? 'var(--color-danger)' : 'var(--accent-color)' }}>{(formData.dti_ratio * 100).toFixed(0)}%</span></div>
                        <input type="range" name="dti_ratio" min="0" max="1" step="0.01" className="risk-model-slider" value={formData.dti_ratio} onChange={handleInputChange} />
                    </div>
                    <div className="risk-input-field"><label>{t('rent_payment')}</label>
                        <input type="number" name="rent_payment_sar" value={formData.rent_payment_sar} onChange={handleInputChange} />
                    </div>
                </div>

                {/* Location */}
                <div className="risk-input-section">
                    <div className="section-label-group"><MapPin size={18} /><h4>{t('location_risk')}</h4></div>
                    <div className="risk-input-field"><label>{t('current_city')}</label>
                        <select name="current_city" value={formData.current_city} onChange={handleInputChange}>
                            <option value="Riyadh">Riyadh</option><option value="Jeddah">Jeddah</option><option value="Dammam">Dammam</option><option value="Madinah">Madinah</option><option value="Makkah">Makkah</option>
                        </select>
                    </div>
                    <div className="risk-input-field"><label>{t('area_risk_level')}</label>
                        <select name="area_risk_level" value={formData.area_risk_level} onChange={handleInputChange}>
                            <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                        </select>
                    </div>
                    <div className="risk-input-field"><label>{t('takaful_coverage')}</label>
                        <input type="number" name="takaful_coverage_sar" value={formData.takaful_coverage_sar} onChange={handleInputChange} />
                    </div>
                    <div className="risk-input-field"><label>{t('verification_status')}</label>
                        <select name="verification_status" value={formData.verification_status} onChange={handleInputChange}>
                            <option value="Passed">Passed</option><option value="Pending">Pending</option><option value="Failed">Failed</option>
                        </select>
                    </div>
                </div>

                <div className="simulation-actions">
                    <button className={`run-simulation-btn ${isSimulating ? 'loading' : ''}`} onClick={runSimulation} disabled={isSimulating}>
                        {isSimulating ? (<><Cpu className="spinning" size={20} /><span>{t('ai_model_processing')}</span></>) : (<><Zap size={20} /><span>{t('run_risk_engine')}</span></>)}
                    </button>
                    <div className="simulation-info">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                        {t('connected_to_model')}
                    </div>
                </div>
            </div>

            {predictionResult && renderResults(t, predictionResult, formData)}
        </div>
    );
}

function renderResults(t, predictionResult, formData) {
    return (
        <div className="risk-results-panel">
            <div className="results-header-with-badge">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ShieldCheck size={32} color="var(--accent-color)" />
                    <div>
                        <h3 style={{ margin: 0 }}>{t('final_decision')}</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('based_on_model')}</p>
                    </div>
                </div>
                <div className={`decision-badge ${predictionResult.decision}`}>
                    {t('system_decision')} {predictionResult.decision.toUpperCase()}
                    {predictionResult.isFallback && <span style={{ display: 'block', fontSize: '10px', opacity: 0.7 }}>{t('fallback_api')}</span>}
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
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <TrendingUp size={18} /> {t('model_probability')}
                </h4>
                {Object.entries(predictionResult.all_probabilities).map(([label, prob]) => (
                    <div className="prob-bar-group" key={label}>
                        <div className="prob-label-row"><span>{label}</span><span>{(prob * 100).toFixed(2)}%</span></div>
                        <div className="prob-bar-bg"><div className={`prob-bar-fill ${label}`} style={{ width: `${prob * 100}%` }}></div></div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                <h4 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Cpu size={18} /> {t('model_strategy')}
                </h4>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {predictionResult.decision === 'Approved' ? (
                        <p>The model shows high confidence for approval. Repayment capacity (DTI: {(formData.dti_ratio * 100).toFixed(1)}%) and Credit Score ({formData.credit_score}) are significantly above the risk threshold. Proceed with standard documentation.</p>
                    ) : predictionResult.decision === 'Review' ? (
                        <p>The application falls in the marginal zone. While the credit score is acceptable, the LTV ratio ({(formData.ltv_ratio * 100).toFixed(0)}%) or employment history suggests a need for human underwriter review to verify income stability further.</p>
                    ) : (
                        <p>The application is rejected primarily due to high risk indicators. Key drivers include multiple missed payments, high DTI ratio, or a credit score below the minimum threshold ({formData.credit_score}).</p>
                    )}
                    <button className="btn-new-case" style={{ marginTop: '1rem', width: 'auto', padding: '0.6rem 1.5rem' }}>
                        {t('generate_risk_report')} <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RiskIntelligenceUnit;
