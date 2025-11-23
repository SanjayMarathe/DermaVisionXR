import React, { useState, useEffect, useRef } from 'react';

interface ConsultationData {
  consensus: {
    diagnosis: string;
    confidence: number;
    summary: string;
    urgency: 'low' | 'medium' | 'high' | 'immediate';
  };
  specialists: Array<{
    role: string;
    name: string;
    assessment: string;
    confidence: number;
    keyFindings: string[];
    recommendations: string[];
  }>;
  agreementScore: number;
  processingTime: number;
}

interface ScanPageProps {
    onBack: () => void;
    onViewReport?: (data: ConsultationData) => void;
}

interface SimilarCase {
    imageId: string;
    similarity: number;
    diagnosis: string;
    age?: number;
    sex?: string;
    localization?: string;
}

interface DiagnosisResult {
    diagnosis: string;
    confidence: number;
    color: string;
    recommendation: string;
    similarCases?: SimilarCase[];
    metadata?: {
        topMatchId: string;
        diagnosisCode: string;
        similarity: number;
    };
}

export const ScanPage: React.FC<ScanPageProps> = ({ onBack, onViewReport }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<DiagnosisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConsulting, setIsConsulting] = useState(false);
    const [consultationProgress, setConsultationProgress] = useState<string[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }
        } catch (err) {
            console.error('Camera access error:', err);
            setError('Unable to access camera. Please grant camera permissions.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const captureFrame = () => {
        if (!videoRef.current || !canvasRef.current) {
            console.error('Video or canvas ref not available');
            return null;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.error('Video not ready - no dimensions');
            return null;
        }

        const context = canvas.getContext('2d');
        if (!context) {
            console.error('Could not get canvas context');
            return null;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL('image/jpeg', 0.95);
        console.log('Captured image size:', imageData.length, 'bytes');
        return imageData;
    };

    const performAnalysis = async () => {
        setIsScanning(true);
        setResult(null);

        try {
            const imageData = captureFrame();
            
            if (!imageData || imageData.length < 100) {
                throw new Error('Failed to capture frame - video may not be ready');
            }

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            const response = await fetch(`${API_URL}/api/analyze-base64`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: imageData })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('🔬 Received analysis data:', data);

            setResult({
                diagnosis: data.diagnosis,
                confidence: data.confidence,
                color: data.color,
                recommendation: data.recommendation,
                similarCases: data.similarCases,
                metadata: data.metadata
            });

        } catch (error) {
            console.error('Analysis failed:', error);
            setError('Analysis failed. Please try again.');
        } finally {
            setIsScanning(false);
        }
    };

    const handleConsultation = async () => {
        if (!result || !onViewReport) return;

        setIsConsulting(true);
        setConsultationProgress([
            '🤖 Starting multi-agent consultation...',
            `📋 Diagnosis: ${result.diagnosis}`
        ]);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            // Simulate progress updates
            setTimeout(() => {
                setConsultationProgress(prev => [...prev, '🔬 Diagnostic AI analyzing...']);
            }, 500);
            setTimeout(() => {
                setConsultationProgress(prev => [...prev, '👨‍⚕️ Dermatologist reviewing case...']);
            }, 2000);
            setTimeout(() => {
                setConsultationProgress(prev => [...prev, '🔬 Pathologist examining features...']);
            }, 4000);
            setTimeout(() => {
                setConsultationProgress(prev => [...prev, '💊 Treatment specialist evaluating...']);
            }, 6000);
            setTimeout(() => {
                setConsultationProgress(prev => [...prev, '⚠️ Risk assessment in progress...']);
            }, 8000);
            setTimeout(() => {
                setConsultationProgress(prev => [...prev, '🤝 Coordinating consensus...']);
            }, 10000);

            const response = await fetch(`${API_URL}/api/consultation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    diagnosisResult: result,
                    patientContext: {} // Can be expanded later with patient info
                })
            });

            if (!response.ok) {
                throw new Error(`Consultation API error: ${response.status}`);
            }

            const consultationData = await response.json();
            console.log('🤖 Consultation complete:', consultationData);

            setConsultationProgress(prev => [
                ...prev,
                '✅ Consultation complete',
                `👥 ${consultationData.specialists.length} specialists consulted`,
                `🎯 Agreement score: ${consultationData.agreementScore}%`,
                `⏱️ Processing time: ${consultationData.processingTime}ms`
            ]);

            // Small delay to show completion message
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Navigate to report page with consultation data
            onViewReport(consultationData);

        } catch (error) {
            console.error('Consultation failed:', error);
            setError('Multi-agent consultation failed. Please try again.');
        } finally {
            setIsConsulting(false);
            setConsultationProgress([]);
        }
    };

    const handleBack = () => {
        stopCamera();
        onBack();
    };

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
                zIndex: 0
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
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '3rem'
                }}>
                    <button 
                        onClick={handleBack}
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
                        ← Back
                    </button>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #00c2ff 0%, #0084ff 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0
                    }}>
                        AI Scan Analysis
                    </h1>
                </div>

                {error ? (
                    <div style={{
                        background: 'rgba(255, 59, 48, 0.1)',
                        border: '1px solid rgba(255, 59, 48, 0.3)',
                        borderRadius: '16px',
                        padding: '2rem',
                        textAlign: 'center',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <p style={{ fontSize: '1.1rem', color: '#ff3b30', marginBottom: '1.5rem' }}>{error}</p>
                        <button 
                            onClick={startCamera}
                            style={{
                                background: 'linear-gradient(135deg, #ff3b30 0%, #ff6b6b 100%)',
                                border: 'none',
                                color: 'white',
                                padding: '0.875rem 2rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 20px rgba(255, 59, 48, 0.3)'
                            }}
                        >
                            Retry Camera Access
                        </button>
                    </div>
                ) : (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '20px',
                        padding: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        marginBottom: '2rem'
                    }}>
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '600px',
                            margin: '0 auto',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '2px solid rgba(0, 194, 255, 0.3)',
                            boxShadow: '0 0 40px rgba(0, 194, 255, 0.2)'
                        }}>
                            {/* Scanning overlay */}
                            {isScanning && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'rgba(0, 194, 255, 0.1)',
                                    zIndex: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        border: '3px solid rgba(0, 194, 255, 0.3)',
                                        borderTop: '3px solid #00c2ff',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }} />
                                </div>
                            )}
                            
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{ 
                                    width: '100%',
                                    display: 'block',
                                    background: '#000'
                                }}
                            />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </div>

                        <div style={{
                            textAlign: 'center',
                            marginTop: '2rem'
                        }}>
                            <button 
                                onClick={performAnalysis} 
                                disabled={isScanning}
                                style={{
                                    background: isScanning 
                                        ? 'rgba(0, 194, 255, 0.3)' 
                                        : 'linear-gradient(135deg, #00c2ff 0%, #0084ff 100%)',
                                    border: 'none',
                                    color: 'white',
                                    padding: '1.25rem 3rem',
                                    borderRadius: '16px',
                                    cursor: isScanning ? 'not-allowed' : 'pointer',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isScanning 
                                        ? 'none' 
                                        : '0 8px 30px rgba(0, 194, 255, 0.4)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isScanning) {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 194, 255, 0.5)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isScanning) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 194, 255, 0.4)';
                                    }
                                }}
                            >
                                {isScanning ? '⚡ Analyzing...' : '🔬 Capture & Analyze'}
                            </button>
                        </div>
                    </div>
                )}

                {result && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '20px',
                        padding: '2.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}>
                        {/* Main diagnosis */}
                        <div style={{
                            background: `linear-gradient(135deg, ${result.color}15 0%, ${result.color}05 100%)`,
                            border: `2px solid ${result.color}40`,
                            borderRadius: '16px',
                            padding: '2rem',
                            marginBottom: '2rem',
                            boxShadow: `0 0 30px ${result.color}20`
                        }}>
                            <h2 style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: result.color,
                                marginBottom: '1rem',
                                textShadow: `0 0 20px ${result.color}40`
                            }}>
                                {result.diagnosis}
                            </h2>
                            <div style={{
                                fontSize: '3rem',
                                fontWeight: '800',
                                color: '#fff',
                                marginBottom: '1rem',
                                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                            }}>
                                {result.confidence}%
                            </div>
                            <p style={{
                                fontSize: '1.1rem',
                                lineHeight: '1.6',
                                color: '#d0d0d0',
                                margin: 0
                            }}>
                                {result.recommendation}
                            </p>
                        </div>

                        {/* Metadata */}
                        {result.metadata && (
                            <div style={{
                                background: 'rgba(0, 194, 255, 0.05)',
                                border: '1px solid rgba(0, 194, 255, 0.2)',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                marginBottom: '2rem',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem' }}>Match ID</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#00c2ff' }}>
                                        {result.metadata.topMatchId}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem' }}>Diagnosis Code</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#00c2ff' }}>
                                        {result.metadata.diagnosisCode}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem' }}>Similarity Score</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#00c2ff' }}>
                                        {result.metadata.similarity.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Similar cases */}
                        {result.similarCases && result.similarCases.length > 0 && (
                            <div>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: '#fff',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{
                                        background: 'linear-gradient(135deg, #00c2ff 0%, #0084ff 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>
                                        Similar Cases
                                    </span>
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gap: '1rem'
                                }}>
                                    {result.similarCases.map((case_, index) => (
                                        <div 
                                            key={index}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '12px',
                                                padding: '1.5rem',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                                e.currentTarget.style.borderColor = 'rgba(0, 194, 255, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '1rem'
                                            }}>
                                                <span style={{
                                                    fontSize: '1.2rem',
                                                    fontWeight: '600',
                                                    color: '#fff'
                                                }}>
                                                    Case {index + 1}: {case_.diagnosis}
                                                </span>
                                                <span style={{
                                                    background: 'rgba(0, 194, 255, 0.2)',
                                                    color: '#00c2ff',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.95rem',
                                                    fontWeight: '700'
                                                }}>
                                                    {case_.similarity}% match
                                                </span>
                                            </div>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                                gap: '1rem',
                                                fontSize: '0.95rem',
                                                color: '#b0b0b0'
                                            }}>
                                                {case_.age && (
                                                    <div>
                                                        <span style={{ color: '#888' }}>Age:</span>{' '}
                                                        <span style={{ color: '#fff', fontWeight: '500' }}>{case_.age}</span>
                                                    </div>
                                                )}
                                                {case_.sex && (
                                                    <div>
                                                        <span style={{ color: '#888' }}>Sex:</span>{' '}
                                                        <span style={{ color: '#fff', fontWeight: '500' }}>{case_.sex}</span>
                                                    </div>
                                                )}
                                                {case_.localization && (
                                                    <div>
                                                        <span style={{ color: '#888' }}>Location:</span>{' '}
                                                        <span style={{ color: '#fff', fontWeight: '500' }}>{case_.localization}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Consultation Progress */}
                        {isConsulting && consultationProgress.length > 0 && (
                            <div style={{
                                marginTop: '2rem',
                                padding: '2rem',
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '2px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '16px',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: '#a855f7',
                                    marginBottom: '1.5rem',
                                    textAlign: 'center'
                                }}>
                                    Multi-Agent Consultation
                                </h3>
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '0.75rem',
                                    maxHeight: '300px',
                                    overflowY: 'auto'
                                }}>
                                    {consultationProgress.map((msg, index) => (
                                        <div 
                                            key={index}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                background: 'rgba(139, 92, 246, 0.05)',
                                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                                borderRadius: '8px',
                                                color: '#e0e0e0',
                                                fontSize: '0.95rem',
                                                animation: 'fadeInUp 0.3s ease-out',
                                                fontFamily: 'monospace'
                                            }}
                                        >
                                            {msg}
                                        </div>
                                    ))}
                                </div>
                                {/* Animated progress bar */}
                                <div style={{
                                    marginTop: '1.5rem',
                                    height: '4px',
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    borderRadius: '2px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #8b5cf6, #a855f7, #8b5cf6)',
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer 2s linear infinite'
                                    }} />
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                            {onViewReport && (
                                <button 
                                    onClick={handleConsultation}
                                    disabled={isConsulting}
                                    style={{
                                        background: isConsulting 
                                            ? 'rgba(139, 92, 246, 0.2)' 
                                            : 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                                        border: 'none',
                                        color: '#fff',
                                        padding: '1rem 2.5rem',
                                        borderRadius: '12px',
                                        cursor: isConsulting ? 'not-allowed' : 'pointer',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)',
                                        opacity: isConsulting ? 0.6 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isConsulting) {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.5)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isConsulting) {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.4)';
                                        }
                                    }}
                                >
                                    {isConsulting ? '🤖 Consulting Specialists...' : '🤖 Get Expert Consultation'}
                                </button>
                            )}
                            <button 
                                onClick={() => setResult(null)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: '#fff',
                                    padding: '1rem 2.5rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                }}
                            >
                                Clear Results
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
};