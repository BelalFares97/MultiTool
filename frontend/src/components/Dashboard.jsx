import React from 'react';
import {
    Users,
    FileText,
    AlertTriangle,
    TrendingUp,
    ChevronRight,
    Activity,
    Shield,
    Clock
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

const Dashboard = ({ language, clientName, setActivePage, cases, uniqueRMs }) => {
    const t = getTranslation(language);

    const stats = [
        {
            label: t('active_rms'),
            value: uniqueRMs.length - 1,
            icon: <Users size={24} />,
            color: '#4f46e5',
            trend: t('trend_this_week')
        },
        {
            label: t('total_cases'),
            value: cases.length,
            icon: <FileText size={24} />,
            color: '#0ea5e9',
            trend: t('trend_last_month')
        },
        {
            label: t('high_risk'),
            value: cases.filter(c => c.risk === 'High').length,
            icon: <AlertTriangle size={24} />,
            color: '#ef4444',
            trend: t('trend_yesterday')
        },
        {
            label: t('avg_ews_score'),
            value: (cases.reduce((acc, c) => acc + (c.ews || 0), 0) / cases.length).toFixed(1),
            icon: <Activity size={24} />,
            color: '#10b981',
            trend: t('trend_stable')
        }
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-hero" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', gridTemplateColumns: 'none' }}>
                <div className="hero-content" style={{ maxWidth: '800px' }}>
                    <div className="hero-badge">
                        <Shield size={16} />
                        <span>{t('ai_advisory')} • Live</span>
                    </div>
                    <h1>{t('welcome_to')} <span className="gradient-text">{clientName}</span></h1>
                    <p>{t('dashboard_description')}</p>
                    <div className="hero-actions">
                        <button className="btn-primary" onClick={() => setActivePage('Cases')}>
                            {t('select_case')}
                            <ChevronRight size={18} />
                        </button>
                        <button className="btn-secondary">
                            <Clock size={18} />
                            {t('operational_guide')}
                        </button>
                    </div>
                </div>

                {/* Stats row spanning full width with 4 columns, now inside dashboard-hero */}
                <div className="hero-stats-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1rem',
                }}>
                    {stats.map((stat, i) => (
                        <div key={i} className="stat-card" style={{
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            padding: '1rem',
                            borderRadius: '16px',
                            gap: '0.25rem',
                            alignItems: 'center',
                            textAlign: 'center'
                        }}>
                            <div className="stat-header" style={{ marginBottom: '0.25rem', display: 'flex', justifyContent: 'center', width: '100%' }}>
                                <div className="stat-icon-wrapper" style={{
                                    backgroundColor: 'var(--accent-color)',
                                    color: 'white',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px'
                                }}>
                                    {React.cloneElement(stat.icon, { size: 18 })}
                                </div>
                            </div>
                            <div className="stat-body" style={{ gap: '0', alignItems: 'center' }}>
                                <span className="stat-value" style={{ fontSize: '1.25rem', lineHeight: '1.2' }}>{stat.value}</span>
                                <span className="stat-label" style={{ fontSize: '0.75rem' }}>{stat.label}</span>
                            </div>
                            <div className="stat-footer" style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', justifyContent: 'center', width: '100%' }}>
                                <div className="stat-trend" style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    width: 'fit-content',
                                    padding: '0.25rem 0.6rem',
                                    fontSize: '0.7rem',
                                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                    color: 'var(--accent-color)',
                                    borderRadius: '100px'
                                }}>
                                    <TrendingUp size={12} />
                                    <span>{stat.trend}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card main-chart">
                    <div className="card-header">
                        <h3>{t('risk_distribution')}</h3>
                        <button className="text-btn">{t('view_full_report')}</button>
                    </div>
                    <div className="chart-placeholder">
                        <div className="bar-group">
                            <div className="bar" style={{ height: '60%', backgroundColor: '#10b981' }}></div>
                            <span>{t('low')}</span>
                        </div>
                        <div className="bar-group">
                            <div className="bar" style={{ height: '40%', backgroundColor: '#f59e0b' }}></div>
                            <span>{t('medium')}</span>
                        </div>
                        <div className="bar-group">
                            <div className="bar" style={{ height: '25%', backgroundColor: '#ef4444' }}></div>
                            <span>{t('high')}</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card recent-activity">
                    <div className="card-header">
                        <h3>{t('recent_activity')}</h3>
                    </div>
                    <div className="activity-list">
                        {cases.slice(0, 4).map((c, i) => (
                            <div key={i} className="activity-item">
                                <div className="activity-icon">
                                    <Activity size={16} />
                                </div>
                                <div className="activity-info">
                                    <span className="activity-text"><strong>{c.rm}</strong> {t('updated_case')} <strong>{c.client}</strong></span>
                                    <span className="activity-time">{c.updated}</span>
                                </div>
                                <div className={`risk-badge ${c.risk.toLowerCase()}`}>
                                    {t(c.risk.toLowerCase())}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
