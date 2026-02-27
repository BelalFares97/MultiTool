import React from 'react';
import { X, FolderPlus, Upload, Trash2 } from 'lucide-react';
import { getTranslation } from '../../i18n/translations';

const NewCaseModal = ({
    isNewCaseOpen,
    setIsNewCaseOpen,
    newCaseData,
    setNewCaseData,
    industriesList,
    handleCaseFiles,
    removeFile,
    handleCreateCase,
    language
}) => {
    const t = getTranslation(language);

    if (!isNewCaseOpen) return null;

    return (
        <div className="settings-overlay open" onClick={() => setIsNewCaseOpen(false)}>
            <div className="settings-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="settings-header">
                    <div className="modal-title-box">
                        <div className="modal-icon-container">
                            <FolderPlus size={24} />
                        </div>
                        <div>
                            <h2>{t('initiate_new_case')}</h2>
                            <p>{t('create_case_desc')}</p>
                        </div>
                    </div>
                    <button className="icon-btn" onClick={() => setIsNewCaseOpen(false)}><X size={20} /></button>
                </div>

                <div className="settings-section modal-body">
                    <div className="input-group">
                        <label>{t('client_name')}</label>
                        <input
                            type="text"
                            placeholder={t('client_name_placeholder')}
                            value={newCaseData.client}
                            onChange={(e) => setNewCaseData({ ...newCaseData, client: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div className="input-group">
                        <label>{t('industry_sector')}</label>
                        <select
                            value={newCaseData.industry}
                            onChange={(e) => setNewCaseData({ ...newCaseData, industry: e.target.value })}
                            className="filter-select full-width"
                        >
                            {industriesList.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>{t('supporting_docs')}</label>
                        <div className="upload-dropzone">
                            <input
                                type="file"
                                multiple
                                accept=".pdf,.csv,.doc,.docx,.jpg,.png"
                                onChange={handleCaseFiles}
                                className="file-input-hidden"
                            />
                            <Upload size={24} className="upload-icon" />
                            <p className="upload-text">{t('upload_text')}</p>
                            <p className="upload-hint">{t('upload_hint')}</p>
                        </div>

                        {newCaseData.files.length > 0 && (
                            <div className="selected-files-list">
                                <p className="folder-preview">
                                    <FolderPlus size={14} />
                                    {t('creating_folder')} {newCaseData.client || 'Client'}_docs/
                                </p>
                                {newCaseData.files.map((file, idx) => (
                                    <div key={idx} className="file-item-preview">
                                        <span className="file-name">{file.name}</span>
                                        <button className="icon-btn delete-file-btn" onClick={() => removeFile(idx)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={() => setIsNewCaseOpen(false)}>{t('cancel')}</button>
                    <button className="btn-primary" onClick={handleCreateCase} disabled={!newCaseData.client}>
                        {t('create_case_btn')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewCaseModal;
