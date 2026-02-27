import React, { useState, useRef } from 'react';
import {
    FileCheck,
    Upload,
    Music,
    Clock,
    Mic,
    List,
    Clock3,
    User,
    CheckSquare,
    Zap,
    Loader2,
    CheckCircle2,
    Download
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

const getSpeakerColor = (speakerName) => {
    const palette = ['#310046', '#7E0035', '#F0E07F', '#B8861D', '#A90000'];
    let hash = 0;
    const str = speakerName || "Unknown";
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palette[Math.abs(hash) % palette.length];
};

const MujazPage = ({ language, onReportReady }) => {
    const t = getTranslation(language);
    const [audioFile, setAudioFile] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setErrorMessage(null);
        if (file && (file.type.includes('audio') || file.name.endsWith('.mp3') || file.name.endsWith('.wav'))) {
            const reader = new FileReader();

            // Extract duration using a temporary audio element
            const audio = new Audio();
            const objectUrl = URL.createObjectURL(file);
            audio.src = objectUrl;

            audio.onloadedmetadata = () => {
                const duration = formatDuration(audio.duration);
                setMetadata({
                    name: file.name,
                    size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                    type: file.type || 'audio/mpeg',
                    length: duration
                });
                setAudioFile(file);
                setAudioUrl(objectUrl); // keep URL alive for the player
                setAnalysisResult(null);
            };
        }
    };

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return [h, m, s]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":");
    };

    const processAudio = async () => {
        setIsProcessing(true);
        setErrorMessage(null);
        try {
            const formData = new FormData();
            formData.append('file', audioFile);

            const response = await fetch('http://localhost:5001/api/mujaz/process', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.status === 'success') {
                setAnalysisResult(result.analysis);
                if (onReportReady) onReportReady(result.analysis, metadata);
            } else {
                setErrorMessage(result.message || result.error || "An unknown error occurred");
                console.error("Backend error:", result);
            }
        } catch (error) {
            setErrorMessage("Failed to connect to backend. Please ensure the Python server is running on port 5001.");
            console.error("Failed to connect to backend:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadTranscript = () => {
        if (!analysisResult) return;
        const textToSave = analysisResult.diarization.map(seg => `[${seg.timestamp}] ${seg.speaker}:\n${seg.text}\n`).join('\n');
        const blob = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${metadata?.name ? metadata.name.split('.')[0] : 'transcript'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="page-container animate-fade-in">
            <div className="dashboard-grid">
                {/* Error Box */}
                {errorMessage && (
                    <div className="dashboard-card" style={{ gridColumn: '1 / -1', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <div style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Zap size={18} />
                            {errorMessage}
                        </div>
                    </div>
                )}

                {/* Upload & Setup Section */}
                <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="card-header">
                        <h3>{language === 'Arabic' ? 'تحميل ومعالجة الملف' : 'Upload & Process'}</h3>
                        {audioFile && !isProcessing && !analysisResult && (
                            <button className="btn-primary" onClick={processAudio}>
                                <Zap size={18} />
                                {language === 'Arabic' ? 'بدء التحليل' : 'Start Analysis'}
                            </button>
                        )}
                    </div>

                    {!audioFile ? (
                        <div
                            className="upload-dropzone"
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                border: '2px dashed var(--border-color)',
                                borderRadius: '16px',
                                padding: '3.5rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'var(--transition)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                        >
                            <input type="file" ref={fileInputRef} hidden accept="audio/wav,audio/mpeg" onChange={handleFileChange} />
                            <div className="upload-icon-circle" style={{ width: '70px', height: '70px', background: 'rgba(79, 70, 229, 0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Upload size={32} style={{ color: 'var(--accent-color)' }} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                {language === 'Arabic' ? 'اسحب وأفلت ملف الاجتماع هنا' : 'Drag & Drop Meeting Audio'}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)' }}>WAV or MP3 format supported (Max 100MB)</p>
                        </div>
                    ) : (
                        <div style={{ background: 'var(--bg-color)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                            {/* File info bar */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                    <div style={{ background: 'rgba(79,70,229,0.1)', borderRadius: '8px', padding: '6px', display: 'flex', flexShrink: 0 }}>
                                        <Music size={16} style={{ color: 'var(--accent-color)' }} />
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{metadata.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                            {metadata.type.split('/')[1]?.toUpperCase() || 'AUDIO'} &nbsp;·&nbsp; {metadata.size} &nbsp;·&nbsp; {metadata.length}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="text-btn"
                                    style={{ color: 'var(--color-danger)', flexShrink: 0, marginInlineStart: '1rem' }}
                                    onClick={() => {
                                        setAudioFile(null);
                                        setAudioUrl(null);
                                        setAnalysisResult(null);
                                    }}
                                >
                                    {language === 'Arabic' ? 'إلغاء' : 'Remove'}
                                </button>
                            </div>
                            {/* Native audio player, styled via CSS */}
                            <div style={{ padding: '1rem 1.25rem' }}>
                                <audio
                                    controls
                                    src={audioUrl}
                                    style={{ width: '100%', borderRadius: '10px', height: '40px', outline: 'none' }}
                                />
                            </div>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="processing-state" style={{ textAlign: 'center', padding: '4rem 0' }}>
                            <Loader2 size={48} className="animate-spin" style={{ color: 'var(--accent-color)', margin: '0 auto 1.5rem' }} />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{language === 'Arabic' ? 'جاري معالجة الصوت...' : 'Intelligent Processing...'}</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {language === 'Arabic'
                                    ? 'نستخدم خوارزميات التعرف على الكلام وتحديد المتحدثين لاستخراج الرؤى.'
                                    : 'Applying speech-to-text, diarization, and LLM summarization.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Structured Analysis Results */}
                {analysisResult && !isProcessing && (
                    <div className="analysis-results-wrapper" style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>

                        {/* Main Analysis Column */}
                        <div className="analysis-main-col" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Full Transcript Section (Using Diarization) */}
                            <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <List size={22} style={{ color: 'var(--accent-color)' }} />
                                            <h3 style={{ margin: 0 }}>{language === 'Arabic' ? 'النص الكامل' : 'Full Transcript'}</h3>
                                        </div>
                                        <button onClick={downloadTranscript} className="btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px', fontSize: '0.85rem' }}>
                                            <Download size={16} />
                                            {language === 'Arabic' ? 'تحميل النص' : 'Download Transcript'}
                                        </button>
                                    </div>
                                </div>
                                <div className="diarization-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {analysisResult.diarization.map((seg, idx) => {
                                        const speakerColor = getSpeakerColor(seg.speaker);
                                        return (
                                            <div key={idx} className="diarization-segment" style={{
                                                borderInlineStart: `4px solid ${speakerColor}`,
                                                paddingInlineStart: '1.25rem',
                                                padding: '1.25rem',
                                                background: 'var(--surface-color)',
                                                borderRadius: '12px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                                                border: '1px solid var(--border-color)',
                                                transition: 'transform 0.2s ease',
                                                color: 'var(--text-primary)'
                                            }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: speakerColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: speakerColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                                                            {seg.speaker ? seg.speaker.replace('Speaker ', '') : '?'}
                                                        </div>
                                                        {seg.speaker}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, background: 'var(--bg-color)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Clock size={12} />
                                                        {seg.timestamp}
                                                    </span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{seg.text}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar/Insights Column */}
                        <div className="analysis-sidebar-col" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Notes/Summary Section */}
                            <div className="dashboard-card" style={{ background: 'linear-gradient(145deg, var(--surface-color), var(--bg-color))', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                <div className="card-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FileCheck size={22} style={{ color: 'var(--accent-color)' }} />
                                        </div>
                                        <h3 style={{ margin: 0 }}>{language === 'Arabic' ? 'ملخص النقاط الرئيسية' : 'Key Meeting Notes'}</h3>
                                    </div>
                                </div>
                                <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: 0 }}>
                                    {analysisResult.notes.map((note, i) => (
                                        <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, background: 'var(--surface-color)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)', marginTop: '8px', flexShrink: 0, boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.1)' }} />
                                            {note}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Action Items Section */}
                            <div className="dashboard-card" style={{ background: 'linear-gradient(145deg, var(--surface-color), var(--bg-color))', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                <div className="card-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <CheckSquare size={22} style={{ color: 'var(--accent-color)' }} />
                                        </div>
                                        <h3 style={{ margin: 0 }}>{language === 'Arabic' ? 'مهام العمل' : 'Action Items'}</h3>
                                    </div>
                                </div>
                                <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: 0 }}>
                                    {analysisResult.actionItems.map((item, i) => (
                                        <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, background: 'var(--surface-color)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)', marginTop: '8px', flexShrink: 0, boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.1)' }} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default MujazPage;
