import React, { useState } from 'react';
import { X, FileText, Upload, Zap, Trash2 } from 'lucide-react';
import { getTranslation } from '../../i18n/translations';

const NewFinanceRequestModal = ({ isOpen, onClose, onCreate, language }) => {
    const t = getTranslation(language);
    const [selectedFile, setSelectedFile] = useState(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
    };

    const handleGenerate = () => {
        if (!selectedFile) {
            alert(language === 'Arabic' ? 'يرجى اختيار مستند/نموذج أولاً.' : 'Please select a document/form first.');
            return;
        }

        // Random data generation
        const firstNames = ['Mohammed', 'Ahmed', 'Fahad', 'Sarah', 'Noura', 'Abdullah', 'Khalid', 'Omar', 'Laila', 'Hessa'];
        const lastNames = ['Al-Saud', 'Al-Faisal', 'Al-Zahrani', 'Al-Qahtani', 'Al-Otaibi', 'Al-Ghamdi', 'Al-Dosari', 'Al-Harbi'];
        const nationalities = ['Saudi', 'Emirati', 'Kuwaiti', 'Jordanian', 'Egyptian'];
        const identityTypes = ['National ID', 'Residency (Iqama)'];
        const employers = ['Aramco', 'STC', 'SABIC', 'NEOM', 'Ministry of Health', 'Ministry of Education', 'Al-Rajhi Bank', 'Private Sector Co'];
        const industries = ['Energy', 'Technology', 'Manufacturing', 'Infrastructure', 'Healthcare', 'Education', 'Finance', 'General Trading'];
        const purposes = ['Home Purchase', 'Residential Construction', 'Villa Acquisition', 'Land Development'];
        const statuses = ['Active / Salaried', 'Self-Employed', 'Government Employee'];

        const fullName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        const nationality = nationalities[Math.floor(Math.random() * nationalities.length)];
        const age = Math.floor(Math.random() * (65 - 22 + 1)) + 22;
        const identityType = identityTypes[Math.floor(Math.random() * identityTypes.length)];
        const creditScore = Math.floor(Math.random() * (850 - 450 + 1)) + 450;
        const employer = employers[Math.floor(Math.random() * employers.length)];
        const industry = industries[Math.floor(Math.random() * industries.length)];
        const employmentStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const monthlySalary = Math.floor(Math.random() * (75000 - 8000 + 1)) + 8000;
        const requestedAmount = Math.floor(Math.random() * (5000000 - 250000 + 1)) + 250000;
        const tenure = Math.floor(Math.random() * (30 - 5 + 1)) + 5;
        const purpose = purposes[Math.floor(Math.random() * purposes.length)];
        const dti = (Math.random() * (0.65 - 0.1) + 0.1).toFixed(2);
        const property = `${purpose} in ${['Riyadh', 'Jeddah', 'Dammam', 'NEOM'][Math.floor(Math.random() * 4)]}`;

        const financeData = {
            fullName, nationality, age, identityType, creditScore,
            employer, industry, employmentStatus, monthlySalary,
            requestedAmount, tenure, purpose, dti, property,
            file: selectedFile
        };

        onCreate(financeData);
    };

    return (
        <div className="settings-overlay open" onClick={onClose}>
            <div className="settings-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="settings-header">
                    <div className="modal-title-box">
                        <div className="modal-icon-container" style={{ background: 'var(--accent-color)', color: 'white' }}>
                            <Zap size={24} />
                        </div>
                        <div>
                            <h2>{t('new_finance_request_title')}</h2>
                            <p>{t('form_ingestion')}</p>
                        </div>
                    </div>
                    <button className="icon-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="settings-section modal-body">
                    <div className="input-group">
                        <label>{t('application_form')}</label>
                        <div className="upload-dropzone" onClick={() => document.getElementById('finance-file-input').click()} style={{ cursor: 'pointer' }}>
                            <input
                                type="file"
                                id="finance-file-input"
                                hidden
                                accept=".pdf,.jpg,.png,.docx"
                                onChange={handleFileChange}
                            />
                            <div className="upload-icon">
                                {selectedFile ? <FileText size={24} className="accent-color" /> : <Upload size={24} />}
                            </div>
                            <p className="upload-text">{selectedFile ? selectedFile.name : t('choose_doc')}</p>
                            <p className="upload-hint">{t('upload_hint_finance')}</p>
                        </div>

                        {selectedFile && (
                            <div className="selected-files-list" style={{ marginTop: '1rem' }}>
                                <div className="file-item-preview">
                                    <span className="file-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={14} /> {selectedFile.name}
                                    </span>
                                    <button className="icon-btn delete-file-btn" onClick={removeFile}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '12px', border: '1px dashed var(--accent-color)', opacity: 0.9 }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Zap size={14} style={{ color: 'var(--accent-color)' }} /> {t('ai_processor_ready')}
                                    </p>
                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {t('ocr_description')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>{t('cancel')}</button>
                    <button
                        className="btn-primary"
                        onClick={handleGenerate}
                        disabled={!selectedFile}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Zap size={16} />
                        {t('extract_data')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewFinanceRequestModal;
