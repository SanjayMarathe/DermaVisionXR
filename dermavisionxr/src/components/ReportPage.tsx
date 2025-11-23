import { useState, useEffect } from "react";

interface AgentResponse {
    role: string;
    name: string;
    assessment: string;
    confidence: number;
    keyFindings: string[];
    recommendations: string[];
}

interface ConsultationData {
    consensus: {
        diagnosis: string;
        confidence: number;
        summary: string;
        urgency: "low" | "medium" | "high" | "immediate";
    };
    specialists: AgentResponse[];
    agreementScore: number;
    processingTime: number;
}

interface ReportPageProps {
    consultationData: ConsultationData | null;
    onBack: () => void;
}

export function ReportPage({ consultationData, onBack }: ReportPageProps) {
    const [visibleAgents, setVisibleAgents] = useState<number[]>([]);

    useEffect(() => {
        if (consultationData) {
            consultationData.specialists.forEach((_, index) => {
                setTimeout(() => {
                    setVisibleAgents((prev) => [...prev, index]);
                }, index * 300);
            });
        }
    }, [consultationData]);

    if (!consultationData) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
                color: '#e0e0e0'
            }}>
                <div style={{ fontSize: '1.5rem' }}>No consultation data available</div>
            </div>
        );
    }

    const { consensus, specialists, agreementScore, processingTime } = consultationData;

    const urgencyConfig = {
        low: { color: "#10b981", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)", label: "Low Priority", icon: "✓" },
        medium: { color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", label: "Moderate Priority", icon: "!" },
        high: { color: "#ef4444", gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", label: "High Priority", icon: "‼️" },
        immediate: { color: "#dc2626", gradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)", label: "Immediate Attention", icon: "⚠️" },
    };

    const urgency = urgencyConfig[consensus.urgency];

    const specialistColors = [
        { border: '#00c2ff', glow: 'rgba(0, 194, 255, 0.3)', neon: '#00c2ff' },
        { border: '#a855f7', glow: 'rgba(168, 85, 247, 0.3)', neon: '#a855f7' },
        { border: '#ec4899', glow: 'rgba(236, 72, 153, 0.3)', neon: '#ec4899' },
        { border: '#10b981', glow: 'rgba(16, 185, 129, 0.3)', neon: '#10b981' },
        { border: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)', neon: '#f59e0b' },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
            color: '#e0e0e0',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            position: 'relative',
            overflow: 'auto'
        }}>
            {/* Animated background grid */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'linear-gradient(rgba(0, 194, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 194, 255, 0.05) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
                pointerEvents: 'none',
                zIndex: 0,
                animation: 'gridMove 20s linear infinite'
            }} />

            {/* Floating orbs */}
            <div style={{
                position: 'fixed',
                top: '10%',
                left: '10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(0, 194, 255, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: 'float 8s ease-in-out infinite',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed',
                bottom: '10%',
                right: '10%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                animation: 'float 10s ease-in-out infinite reverse',
                pointerEvents: 'none'
            }} />

            {/* Content container */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '2rem'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '3rem'
                }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'rgba(0, 194, 255, 0.1)',
                            border: '1px solid rgba(0, 194, 255, 0.3)',
                            color: '#00c2ff',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 15px rgba(0, 194, 255, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 194, 255, 0.2)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 194, 255, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        ← Back to Scan
                    </button>
                    <div style={{
                        fontSize: '0.9rem',
                        color: '#888',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        ⏱️ {(processingTime / 1000).toFixed(1)}s
                    </div>
                </div>

                {/* Page Title */}
                <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #00c2ff 0%, #a855f7 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem',
                        textShadow: '0 0 40px rgba(0, 194, 255, 0.3)'
                    }}>
                        Multi-Specialist Report
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#a0a0a0' }}>
                        AI-Powered Medical Consultation
                    </p>
                </div>

                {/* Consensus Card with Holographic Effect */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '20px',
                    padding: '2.5rem',
                    border: '2px solid rgba(0, 194, 255, 0.3)',
                    backdropFilter: 'blur(20px)',
                    marginBottom: '3rem',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0, 194, 255, 0.2), inset 0 0 40px rgba(0, 194, 255, 0.05)'
                }}>
                    {/* Shimmer effect */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                        animation: 'shimmer 3s infinite'
                    }} />

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <div style={{
                            fontSize: '3rem',
                            filter: 'drop-shadow(0 0 10px rgba(0, 194, 255, 0.5))'
                        }}>🏥</div>
                        <div>
                            <h2 style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: '#00c2ff',
                                marginBottom: '0.25rem',
                                textShadow: '0 0 20px rgba(0, 194, 255, 0.5)'
                            }}>
                                Consensus Diagnosis
                            </h2>
                            <div style={{ fontSize: '0.9rem', color: '#888' }}>
                                Agreement Score: <span style={{ 
                                    color: '#00c2ff', 
                                    fontWeight: '700',
                                    fontSize: '1.1rem'
                                }}>{agreementScore}%</span>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        <div>
                            <div style={{ 
                                fontSize: '0.85rem', 
                                color: '#888', 
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Diagnosis
                            </div>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#fff',
                                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                            }}>
                                {consensus.diagnosis}
                            </div>
                        </div>
                        <div>
                            <div style={{ 
                                fontSize: '0.85rem', 
                                color: '#888', 
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Confidence Level
                            </div>
                            <div style={{
                                width: '100%',
                                height: '12px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                marginBottom: '0.5rem',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                                <div style={{
                                    width: `${consensus.confidence}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #00c2ff 0%, #a855f7 100%)',
                                    borderRadius: '6px',
                                    boxShadow: '0 0 10px rgba(0, 194, 255, 0.5)',
                                    transition: 'width 1s ease-out'
                                }} />
                            </div>
                            <div style={{
                                fontSize: '1.3rem',
                                fontWeight: '700',
                                color: '#00c2ff'
                            }}>
                                {consensus.confidence}%
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: 'rgba(0, 194, 255, 0.05)',
                        border: '1px solid rgba(0, 194, 255, 0.2)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ 
                            fontSize: '0.85rem', 
                            color: '#888', 
                            marginBottom: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Summary
                        </div>
                        <p style={{
                            fontSize: '1.1rem',
                            lineHeight: '1.7',
                            color: '#d0d0d0',
                            margin: 0
                        }}>
                            {consensus.summary}
                        </p>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: `2px solid ${urgency.color}`,
                        background: `${urgency.color}15`,
                        boxShadow: `0 0 20px ${urgency.color}30`
                    }}>
                        <div style={{
                            fontSize: '3rem',
                            filter: `drop-shadow(0 0 10px ${urgency.color})`
                        }}>
                            {urgency.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '0.85rem',
                                color: '#888',
                                marginBottom: '0.25rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Urgency Level
                            </div>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: urgency.color,
                                textShadow: `0 0 15px ${urgency.color}`
                            }}>
                                {urgency.label}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Specialists Section Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem'
                    }}>
                        Specialist Opinions
                    </h2>
                    <p style={{ color: '#888', fontSize: '1rem' }}>
                        {specialists.length} experts consulted
                    </p>
                </div>

                {/* Specialist Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {specialists.map((agent, index) => {
                        const colorScheme = specialistColors[index % specialistColors.length];
                        const isVisible = visibleAgents.includes(index);
                        
                        return (
                            <div
                                key={index}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '16px',
                                    padding: '2rem',
                                    border: `2px solid ${colorScheme.border}40`,
                                    backdropFilter: 'blur(20px)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: `0 8px 32px ${colorScheme.glow}`,
                                    opacity: isVisible ? 1 : 0,
                                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                                    transition: 'all 0.6s ease-out',
                                    transitionDelay: `${index * 150}ms`
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = `0 12px 48px ${colorScheme.glow}`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = `0 8px 32px ${colorScheme.glow}`;
                                }}
                            >
                                {/* Neon accent line */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: colorScheme.border,
                                    boxShadow: `0 0 10px ${colorScheme.neon}`
                                }} />

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'start',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div>
                                        <div style={{
                                            fontSize: '0.85rem',
                                            color: colorScheme.neon,
                                            marginBottom: '0.5rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            fontWeight: '600'
                                        }}>
                                            {agent.role}
                                        </div>
                                        <div style={{
                                            fontSize: '1.5rem',
                                            fontWeight: '700',
                                            color: '#fff',
                                            textShadow: `0 0 15px ${colorScheme.glow}`
                                        }}>
                                            {agent.name}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: `${colorScheme.border}20`,
                                        border: `1px solid ${colorScheme.border}`,
                                        borderRadius: '12px',
                                        padding: '0.75rem 1.25rem',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: '#888',
                                            marginBottom: '0.25rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            Confidence
                                        </div>
                                        <div style={{
                                            fontSize: '1.5rem',
                                            fontWeight: '800',
                                            color: colorScheme.neon,
                                            textShadow: `0 0 10px ${colorScheme.neon}`
                                        }}>
                                            {agent.confidence}%
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        color: '#888',
                                        marginBottom: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        Assessment
                                    </div>
                                    <p style={{
                                        fontSize: '1rem',
                                        lineHeight: '1.7',
                                        color: '#d0d0d0',
                                        margin: 0
                                    }}>
                                        {agent.assessment}
                                    </p>
                                </div>

                                {agent.keyFindings.length > 0 && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{
                                            fontSize: '0.95rem',
                                            color: colorScheme.neon,
                                            fontWeight: '700',
                                            marginBottom: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            textShadow: `0 0 10px ${colorScheme.glow}`
                                        }}>
                                            <span>🔍</span> Key Findings
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {agent.keyFindings.map((finding, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        paddingLeft: '1rem',
                                                        borderLeft: `3px solid ${colorScheme.border}`,
                                                        color: '#c0c0c0',
                                                        fontSize: '0.95rem',
                                                        lineHeight: '1.6',
                                                        background: `${colorScheme.border}08`,
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '0 8px 8px 0'
                                                    }}
                                                >
                                                    {finding}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {agent.recommendations.length > 0 && (
                                    <div>
                                        <div style={{
                                            fontSize: '0.95rem',
                                            color: colorScheme.neon,
                                            fontWeight: '700',
                                            marginBottom: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            textShadow: `0 0 10px ${colorScheme.glow}`
                                        }}>
                                            <span>💡</span> Recommendations
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {agent.recommendations.map((rec, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        paddingLeft: '1rem',
                                                        borderLeft: `3px solid ${colorScheme.border}`,
                                                        color: '#c0c0c0',
                                                        fontSize: '0.95rem',
                                                        lineHeight: '1.6',
                                                        background: `${colorScheme.border}08`,
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '0 8px 8px 0'
                                                    }}
                                                >
                                                    {rec}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Disclaimer */}
                <div style={{
                    marginTop: '3rem',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <p style={{
                        fontSize: '0.9rem',
                        color: '#888',
                        lineHeight: '1.6',
                        margin: 0
                    }}>
                        <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>⚠️</span>
                        <strong style={{ color: '#a0a0a0' }}>Medical Disclaimer:</strong> This AI-powered analysis is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare provider for diagnosis, treatment, or medical decisions.
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes gridMove {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(50px, 50px); }
                }
                
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(20px, 20px); }
                }
                
                @keyframes shimmer {
                    0% { left: -100%; }
                    100% { left: 200%; }
                }
            `}</style>
        </div>
    );
}