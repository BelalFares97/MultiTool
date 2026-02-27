import React, { useState, useRef } from 'react';
import { X, Sun, Moon, Globe, Upload, Eye, EyeOff, GripVertical } from 'lucide-react';
import { getTranslation } from '../../i18n/translations';

const SettingsPanel = ({
    isSettingsOpen,
    setIsSettingsOpen,
    clientName,
    setClientName,
    clientLogo,
    setClientLogo,
    userName,
    setUserName,
    userImage,
    setUserImage,
    language,
    setLanguage,
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    iconColor,
    setIconColor,
    handleFileUpload,
    navItems,
    setNavItems
}) => {
    const t = getTranslation(language);
    const dragItem = useRef();
    const dragOverItem = useRef();
    const [draggingIndex, setDraggingIndex] = useState(null);

    if (!isSettingsOpen) return null;

    const handleTabNameChange = (id, newLabel) => {
        setNavItems(prev => prev.map(item => item.id === id ? { ...item, label: newLabel } : item));
    };

    const toggleTabVisibility = (id) => {
        setNavItems(prev => prev.map(item => item.id === id ? { ...item, isVisible: !item.isVisible } : item));
    };

    const handleDragStart = (e, index) => {
        dragItem.current = index;
        setDraggingIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            e.target.classList.add('dragging');
        }, 0);
    };

    const handleDragEnter = (e, index) => {
        dragOverItem.current = index;
    };

    const handleDragEnd = (e) => {
        if (dragItem.current !== null && dragOverItem.current !== null) {
            const newList = [...navItems];
            const draggedItemContent = newList.splice(dragItem.current, 1)[0];
            newList.splice(dragOverItem.current, 0, draggedItemContent);

            dragItem.current = null;
            dragOverItem.current = null;
            setNavItems(newList);
        }
        setDraggingIndex(null);
        e.target.classList.remove('dragging');
    };

    const renderLogoInput = (value, setter, labelText) => (
        <div className="input-group">
            <label>{labelText}</label>
            <div className="logo-input-wrapper">
                <input
                    type="text"
                    value={value.startsWith('data:') ? t('local_asset') : value}
                    readOnly
                    className="readonly-input"
                />
                <label className="upload-btn-label">
                    <Upload size={18} />
                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, setter)} />
                </label>
            </div>
        </div>
    );

    return (
        <div className={`settings-overlay ${isSettingsOpen ? 'open' : ''}`} onClick={() => setIsSettingsOpen(false)}>
            <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <h2 className="settings-title">{t('personalization')}</h2>
                    <button className="icon-btn" onClick={() => setIsSettingsOpen(false)}><X size={20} /></button>
                </div>

                <div className="settings-section">
                    <div className="input-group">
                        <label>{t('interface_language')}</label>
                        <div className="toggle-group">
                            <button className={`toggle-btn ${language === 'English' ? 'active' : ''}`} onClick={() => setLanguage('English')}>
                                <Globe size={16} /> {t('english')}
                            </button>
                            <button className={`toggle-btn ${language === 'Arabic' ? 'active' : ''}`} onClick={() => setLanguage('Arabic')}>
                                <Globe size={16} /> {t('arabic')}
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>{t('theme_mode')}</label>
                        <div className="toggle-group">
                            <button className={`toggle-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
                                <Sun size={16} /> {t('light')}
                            </button>
                            <button className={`toggle-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
                                <Moon size={16} /> {t('dark')}
                            </button>
                        </div>
                    </div>

                    <div className="settings-divider"></div>
                    <label className="section-label">{t('sidebar_tabs_config')}</label>
                    <div className="tabs-management">
                        {navItems.map((item, index) => (
                            <div
                                key={item.id}
                                className={`tab-control-item ${draggingIndex === index ? 'dragging' : ''}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <div className="drag-handle">
                                    <GripVertical size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={item.label}
                                    onChange={(e) => handleTabNameChange(item.id, e.target.value)}
                                    placeholder={item.id}
                                />
                                <button
                                    className={`visibility-toggle ${item.isVisible ? 'visible' : 'hidden'}`}
                                    onClick={() => toggleTabVisibility(item.id)}
                                    title={item.isVisible ? t('hide_tab') : t('show_tab')}
                                >
                                    {item.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="settings-divider"></div>

                    <div className="input-group">
                        <label>{t('client_name_setting')}</label>
                        <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                    </div>

                    {renderLogoInput(clientLogo, setClientLogo, t('client_logo_setting'))}

                    <div className="input-group">
                        <label>{t('user_full_name')}</label>
                        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
                    </div>

                    {renderLogoInput(userImage, setUserImage, t('user_avatar_setting'))}

                    <div className="settings-grid">
                        <div className="input-group">
                            <label>{t('accent_color')}</label>
                            <div className="color-picker-wrapper">
                                <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                                <span>{accentColor}</span>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>{t('icon_color')}</label>
                            <div className="color-picker-wrapper">
                                <input type="color" value={iconColor} onChange={(e) => setIconColor(e.target.value)} />
                                <span>{iconColor}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settings-footer">
                    <p className="settings-hint">{t('settings_hint')}</p>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
