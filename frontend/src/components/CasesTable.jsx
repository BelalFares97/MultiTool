import React from 'react';
import { MessageCircle, Trash2, FileText, FolderOpen, ShieldAlert } from 'lucide-react';
import { getTranslation } from '../i18n/translations';

const CasesTable = ({
    filteredCases = [],
    filterRisk,
    setFilterRisk,
    filterIndustry,
    setFilterIndustry,
    filterRM,
    setFilterRM,
    filterStatus,
    setFilterStatus,
    uniqueIndustries = [],
    uniqueRMs = [],
    handleOpenCase,
    handleOpenRiskIntelligence,
    handleDeleteCase,
    language
}) => {
    const t = getTranslation(language);

    const filterConfigs = [
        { label: t('risk_level'), value: filterRisk, setter: setFilterRisk, options: ['All', 'Low', 'Medium', 'High'] },
        { label: t('industry'), value: filterIndustry, setter: setFilterIndustry, options: uniqueIndustries },
        { label: t('rm_owner'), value: filterRM, setter: setFilterRM, options: uniqueRMs },
        { label: t('status'), value: filterStatus, setter: setFilterStatus, options: ['All', 'New', 'Under Review', 'Actioned'] }
    ];

    if (!filteredCases) return <div className="p-4">{t('loading_cases')}</div>;

    return (
        <div className="cases-page-content">
            <div className="table-container">
                <div className="table-controls">
                    {filterConfigs.map((filter, idx) => (
                        <div className="filter-group" key={idx}>
                            <label>{filter.label}</label>
                            <select className="filter-select" value={filter.value} onChange={(e) => filter.setter(e.target.value)}>
                                {filter.options.map((opt, i) => (
                                    <option key={i} value={opt}>{opt === 'All' ? t('all') : opt}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>

                <div className="table-scroll-area">
                    {filteredCases.length === 0 ? (
                        <div className="empty-state" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <FolderOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3>{t('no_cases_found')}</h3>
                            <p>{t('try_adjusting_filters')}</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t('case_id')}</th>
                                    <th>{t('client')}</th>
                                    <th>{t('industry')}</th>
                                    <th>{t('risk')}</th>
                                    <th>{t('ews')}</th>
                                    <th>{t('updated')}</th>
                                    <th>{t('status')}</th>
                                    <th style={{ textAlign: 'center' }}>{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCases.map((caseItem) => (
                                    <tr key={caseItem.id}>
                                        <td className="case-id">{caseItem.id}</td>
                                        <td className="case-client">{caseItem.client}</td>
                                        <td className="case-industry">
                                            <div className="industry-content">
                                                <span>{caseItem.industry}</span>
                                                {caseItem.files && caseItem.files.length > 0 && (
                                                    <span className="attachment-count">
                                                        <FileText size={10} style={{ display: 'inline', marginInlineEnd: '2px' }} />
                                                        {caseItem.files.length} {t('attachments')}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge risk-${caseItem.risk.toLowerCase()}`}>
                                                {caseItem.risk}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="ews-container">
                                                <div className="ews-bar-bg">
                                                    <div
                                                        className="ews-bar-fill"
                                                        style={{
                                                            width: `${(caseItem.ews / 20) * 100}%`,
                                                            background: caseItem.ews > 10 ? 'var(--chart-high)' : 'var(--accent-color)'
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="ews-value">{caseItem.ews}</span>
                                            </div>
                                        </td>
                                        <td className="case-date">{caseItem.updated}</td>
                                        <td>
                                            <span className={`status-text status-${caseItem.status.toLowerCase().replace(' ', '')}`}>
                                                {caseItem.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <button
                                                    className="icon-btn action-btn-view"
                                                    title={t('open_rm_assistant')}
                                                    onClick={(e) => handleOpenCase(caseItem, e)}
                                                >
                                                    <MessageCircle size={16} />
                                                </button>
                                                <button
                                                    className="icon-btn action-btn-risk"
                                                    title={t('open_risk_intelligence')}
                                                    onClick={(e) => handleOpenRiskIntelligence(caseItem, e)}
                                                >
                                                    <ShieldAlert size={16} />
                                                </button>
                                                <button
                                                    className="icon-btn action-btn-delete"
                                                    title={t('delete_case')}
                                                    onClick={(e) => handleDeleteCase(caseItem.id, e)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CasesTable;
