import React from 'react';
import { Search, ShieldCheck, Activity } from 'lucide-react';
import { getTranslation } from '../i18n/translations';

const MudaqqiqPage = ({ language }) => {
    const t = getTranslation(language);

    return (
        <div className="page-container animate-fade-in">
            <div className="hero-card">
                <div className="hero-content">
                    <div className="hero-badge">
                        <Search size={16} />
                        <span>Audit & Verification</span>
                    </div>
                    <h1>MudaQQiQ</h1>
                    <p>Advanced compliance engine and automated audit trail verification for financial documents.</p>
                </div>
            </div>

            <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
                <div className="dashboard-card main-chart">
                    <div className="card-header">
                        <h3>System Verification Status</h3>
                    </div>
                    <div className="coming-soon-content" style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <ShieldCheck size={64} style={{ color: 'var(--accent-color)', marginBottom: '1rem', opacity: 0.5 }} />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Verification Module Loading</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>MudaQQiQ is currently initializing the audit protocols.</p>
                    </div>
                </div>

                <div className="dashboard-card recent-activity">
                    <div className="card-header">
                        <h3>Recent Audits</h3>
                    </div>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon"><Activity size={16} /></div>
                            <div className="activity-info">
                                <span className="activity-text">Protocol check for Case #8291</span>
                                <span className="activity-time">Pending Initialization</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MudaqqiqPage;
