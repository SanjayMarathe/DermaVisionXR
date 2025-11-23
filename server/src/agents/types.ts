// Types for multi-agent consultation system

export interface DiagnosisResult {
  diagnosis: string;
  confidence: number;
  recommendation: string;
  similarCases: Array<{
    id: string;
    diagnosis: string;
    similarity: number;
    metadata: {
      age: number;
      sex: string;
      localization: string;
    };
  }>;
}

export interface PatientContext {
  age?: number;
  sex?: string;
  symptoms?: string;
  duration?: string;
  medicalHistory?: string;
}

export interface AgentResponse {
  role: string;
  name: string;
  assessment: string;
  confidence: number;
  keyFindings: string[];
  recommendations: string[];
}

export interface ConsultationResponse {
  consensus: {
    diagnosis: string;
    confidence: number;
    summary: string;
    urgency: 'low' | 'medium' | 'high' | 'immediate';
  };
  specialists: AgentResponse[];
  agreementScore: number;
  processingTime: number;
}
