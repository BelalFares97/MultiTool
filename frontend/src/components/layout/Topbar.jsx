import React from 'react';
import { Settings, FileDown } from 'lucide-react';
import { getTranslation } from '../../i18n/translations';

const Topbar = ({
    activePage,
    pageInfo,
    language,
    setIsNewCaseOpen,
    setIsNewFinanceRequestOpen,
    setIsSettingsOpen,
    onGeneratePDF,
    hasMujazReport,
}) => {
    const t = getTranslation(language);

    return (
        <header className="topbar">
            <div className="topbar-page-info">
                <h1 className="topbar-title">{pageInfo[activePage]?.title || activePage}</h1>
                <p className="topbar-subtitle">{pageInfo[activePage]?.subtitle || ''}</p>
            </div>
            <div className="topbar-actions">
                {activePage === 'Cases' && (
                    <button
                        className="btn-outline"
                        onClick={() => setIsNewFinanceRequestOpen(true)}
                        style={{ marginInlineEnd: '0.75rem' }}
                    >
                        {t('new_finance_request')}
                    </button>
                )}
                {activePage === 'Mujaz' && (
                    <button
                        className="btn-new-case"
                        onClick={hasMujazReport ? onGeneratePDF : undefined}
                        disabled={!hasMujazReport}
                        style={{
                            opacity: hasMujazReport ? 1 : 0.45,
                            cursor: hasMujazReport ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        title={hasMujazReport ? 'Download PDF Report' : 'Process an audio file first'}
                    >
                        <FileDown size={16} />
                        {t('generate_pdf_report')}
                    </button>
                )}
                <button className="icon-btn" onClick={() => setIsSettingsOpen(true)}>
                    <Settings size={22} />
                </button>
            </div>
        </header>
    );
};

export default Topbar;
