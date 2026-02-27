import React from 'react';
import {
    LayoutDashboard,
    MessageCircle,
    Files,
    ShieldAlert,
    ChevronRight,
    ChevronLeft,
    FileText,
    Search,
    FileCheck
} from 'lucide-react';
import { getTranslation } from '../../i18n/translations';

const Sidebar = ({
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    clientLogo,
    clientName,
    activePage,
    setActivePage,
    userImage,
    userName,
    navItems,
    language
}) => {
    const t = getTranslation(language);
    const isRTL = language === 'Arabic';

    const iconMap = {
        'Dashboard': <LayoutDashboard size={20} />,
        'Tamkeen': <MessageCircle size={20} />,
        'RafeeQ': <FileText size={20} />,
        'MudaQQiQ': <Search size={20} />,
        'Mujaz': <FileCheck size={20} />,
        'Cases': <Files size={20} />,
        'Miqyas Credit': <ShieldAlert size={20} />,
    };

    const navLabelMap = {
        'Dashboard': t('nav_dashboard'),
        'Tamkeen': t('nav_rms_assistant'),
        'RafeeQ': t('nav_conversational_doc'),
        'MudaQQiQ': t('nav_mudaqqiq'),
        'Mujaz': t('nav_mujaz'),
        'Cases': t('nav_cases'),
        'Miqyas Credit': t('nav_risk_intelligence'),
    };

    const getNavLabel = (item) => {
        return language === 'Arabic' ? (navLabelMap[item.id] || item.label) : item.label;
    };

    return (
        <aside className="sidebar">
            <button
                className="sidebar-toggle"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
                {isSidebarCollapsed
                    ? (isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />)
                    : (isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />)
                }
            </button>
            <div className="sidebar-logo-container">
                <div className="logo-box">
                    <img src={clientLogo} alt="Client Logo" className="client-logo" />
                </div>
                {!isSidebarCollapsed && <h2 className="client-name">{clientName}</h2>}
            </div>

            <nav className="nav-links">
                {navItems.filter(item => item.isVisible).map((item) => (
                    <button
                        key={item.id}
                        className={`nav-button ${item.id === activePage ? 'active' : ''}`}
                        onClick={() => setActivePage(item.id)}
                        title={isSidebarCollapsed ? getNavLabel(item) : ''}
                    >
                        {iconMap[item.id]}
                        {!isSidebarCollapsed && <span>{getNavLabel(item)}</span>}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <img src={userImage} alt="User" className="user-avatar" />
                    {!isSidebarCollapsed && (
                        <div className="user-info">
                            <span className="user-name">{userName}</span>
                            <span className="user-role">{t('administrator')}</span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
