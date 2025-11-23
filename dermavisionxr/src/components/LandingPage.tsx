import React from 'react';

interface LandingPageProps {
    onLaunch: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
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
                animation: 'gridMove 20s linear infinite',
                pointerEvents: 'none'
            }} />

            {/* Floating orbs */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(0, 194, 255, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: 'float 8s ease-in-out infinite'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '10%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(0, 132, 255, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                animation: 'float 10s ease-in-out infinite reverse'
            }} />

            {/* Content container */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '2rem',
                textAlign: 'center'
            }}>
                {/* Logo/Brand */}
                <div style={{
                    marginBottom: '2rem',
                    animation: 'fadeInDown 1s ease-out'
                }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        margin: '0 auto 1.5rem',
                        background: 'linear-gradient(135deg, #00c2ff 0%, #0084ff 100%)',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(0, 194, 255, 0.4), 0 0 60px rgba(0, 194, 255, 0.2)',
                        animation: 'pulse 3s ease-in-out infinite',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            inset: '-2px',
                            background: 'linear-gradient(135deg, #00c2ff, #0084ff)',
                            borderRadius: '24px',
                            opacity: 0.5,
                            filter: 'blur(10px)',
                            zIndex: -1
                        }} />
                        <span style={{
                            fontSize: '3rem',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                        }}>🔬</span>
                    </div>

                    <h1 style={{
                        fontSize: '4rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #00c2ff 0%, #0084ff 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem',
                        letterSpacing: '-0.02em',
                        textShadow: '0 0 40px rgba(0, 194, 255, 0.3)'
                    }}>
                        DermaVisionXR
                    </h1>

                    <p style={{
                        fontSize: '1.5rem',
                        color: '#a0a0a0',
                        fontWeight: '500',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                    }}>
                        AI-Powered Skin Analysis
                    </p>
                </div>

                {/* Feature badges */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    justifyContent: 'center',
                    marginBottom: '3rem',
                    animation: 'fadeIn 1s ease-out 0.3s both'
                }}>
                    {[
                        { icon: '🤖', text: 'AI-Powered' },
                        { icon: '⚡', text: 'Instant Results' },
                        { icon: '🎯', text: '5 Profesional AI Insights' },
                        { icon: '🔒', text: 'Private & Secure' }
                    ].map((feature, index) => (
                        <div
                            key={index}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '0.75rem 1.5rem',
                                backdropFilter: 'blur(10px)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s ease',
                                animation: `fadeIn 1s ease-out ${0.3 + index * 0.1}s both`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(0, 194, 255, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(0, 194, 255, 0.3)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <span style={{ fontSize: '1.25rem' }}>{feature.icon}</span>
                            <span style={{
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                color: '#d0d0d0'
                            }}>
                                {feature.text}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Main description */}
                <div style={{
                    maxWidth: '700px',
                    marginBottom: '3rem',
                    animation: 'fadeIn 1s ease-out 0.5s both'
                }}>
                    <p style={{
                        fontSize: '1.25rem',
                        lineHeight: '1.8',
                        color: '#b0b0b0',
                        marginBottom: '1.5rem'
                    }}>
                        Experience the future of dermatological screening with advanced AI technology and spatial computing on Apple Vision Pro.
                    </p>
                    <p style={{
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        color: '#888',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '1rem 1.5rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        Powered by CLIP vision transformers and the HAM10000 medical dataset with 10,000+ verified cases.
                    </p>
                </div>

                {/* Launch button */}
                <div style={{
                    animation: 'fadeInUp 1s ease-out 0.7s both'
                }}>
                    <button
                        onClick={onLaunch}
                        style={{
                            background: 'linear-gradient(135deg, #00c2ff 0%, #0084ff 100%)',
                            border: 'none',
                            color: 'white',
                            padding: '1.5rem 4rem',
                            fontSize: '1.3rem',
                            fontWeight: '700',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 8px 32px rgba(0, 194, 255, 0.4), 0 0 60px rgba(0, 194, 255, 0.2)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 194, 255, 0.5), 0 0 80px rgba(0, 194, 255, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 194, 255, 0.4), 0 0 60px rgba(0, 194, 255, 0.2)';
                        }}
                    >
                        <span style={{ position: 'relative', zIndex: 1 }}>
                            🚀 Launch Scan
                        </span>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                            animation: 'shimmer 3s infinite'
                        }} />
                    </button>
                </div>

                {/* Disclaimer */}
                <div style={{
                    marginTop: '4rem',
                    maxWidth: '600px',
                    animation: 'fadeIn 1s ease-out 1s both'
                }}>
                    <p style={{
                        fontSize: '0.85rem',
                        color: '#666',
                        lineHeight: '1.6',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '1rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        ⚠️ <strong style={{ color: '#888' }}>Medical Disclaimer:</strong> This tool provides preliminary screening only and is not a substitute for professional medical diagnosis. Always consult a licensed dermatologist for concerns about your skin.
                    </p>
                </div>

                {/* Tech stack badges */}
                <div style={{
                    marginTop: '3rem',
                    display: 'flex',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    opacity: 0.6,
                    animation: 'fadeIn 1s ease-out 1.2s both'
                }}>
                    {['React', 'TypeScript', 'WebSpatial', 'CLIP AI', 'Pinecone'].map((tech, index) => (
                        <div
                            key={index}
                            style={{
                                fontSize: '0.8rem',
                                color: '#666',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                fontWeight: '600'
                            }}
                        >
                            {tech}
                        </div>
                    ))}
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
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeInDown {
                    from { 
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeInUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                         opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes shimmer {
                    0% { left: -100%; }
                    100% { left: 200%; }
                }
            `}</style>
        </div>
    );
};