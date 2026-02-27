import re

file_path = r'd:\\Full Projects\\User Interface - Multi Tool\\frontend\\src\\pages\\MujazPage.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update IMPORTS
content = content.replace(
    'CheckCircle2\\n} from \\'lucide-react\\';',
    'CheckCircle2,\\n    Users,\\n    MessageSquare,\\n    Activity,\\n    FileText,\\n    BarChart2,\\n    Tag\\n} from \\'lucide-react\\';'
)

# 2. Update STATE
content = content.replace(
    'const [errorMessage, setErrorMessage] = useState(null);\\n    const fileInputRef = useRef(null);',
    'const [errorMessage, setErrorMessage] = useState(null);\\n    const [activeTab, setActiveTab] = useState(\\'diarization\\');\\n    const fileInputRef = useRef(null);'
)

# 3. Update PORT
content = content.replace('http://localhost:5000/api/mujaz/process', 'http://localhost:5001/api/mujaz/process')

# 4. Update the diarization render loop
diar_old = r'''                                    {analysisResult.diarization.map((seg, idx) => (
                                        <div key={idx} className="diarization-segment" style={{ borderInlineStart: '4px solid var(--accent-color)', paddingInlineStart: '1.25rem', padding: '1rem', background: 'rgba(79, 70, 229, 0.02)', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <User size={14} /> {seg.speaker}
                                                </span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{seg.timestamp}</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{seg.text}</p>
                                        </div>
                                    ))}'''

diar_new = r'''                                    {analysisResult.diarization.map((seg, idx) => {
                                        const speakerNum = parseInt(seg.speaker.replace(/\D/g, '')) || 1;
                                        const hues = [230, 280, 160, 30, 340, 190, 45];
                                        const hue = hues[speakerNum % hues.length];
                                        const speakerColor = hsl(, 70%, 55%);
                                        const speakerBg = hsl(, 70%, 97%);

                                        return (
                                            <div key={idx} className="diarization-segment group" style={{ 
                                                display: 'flex', gap: '1rem', padding: '1.25rem', 
                                                background: 'var(--surface-color)', borderRadius: '16px', 
                                                border: '1px solid var(--border-color)',
                                                transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', position: 'relative'
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', gap: '6px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: speakerBg, color: speakerColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', border: 2px solid  }}>
                                                        {seg.speaker.replace('Speaker ', '')}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                                        {seg.timestamp.split(' - ')[0]}
                                                    </div>
                                                </div>
                                                <div style={{ flexGrow: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: speakerColor }}>
                                                            {seg.speaker}
                                                        </span>
                                                        {seg.confidence && (
                                                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '10px' }}>
                                                                {(seg.confidence * 100).toFixed(0)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{seg.text}</p>
                                                </div>
                                            </div>
                                        );
                                    })}'''

content = content.replace(diar_old, diar_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done replacing.")
