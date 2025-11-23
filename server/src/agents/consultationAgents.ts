// Multi-agent consultation system using Anthropic Claude

import Anthropic from '@anthropic-ai/sdk';
import { AGENT_PROMPTS, formatInputForAgent } from './prompts';
import type { 
  DiagnosisResult, 
  PatientContext, 
  AgentResponse, 
  ConsultationResponse 
} from './types';

// Lazy initialize Claude client to ensure env vars are loaded
let anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
}

// Individual agent classes
class SpecialistAgent {
  private role: string;
  private name: string;
  private systemPrompt: string;

  constructor(role: string, name: string, systemPrompt: string) {
    this.role = role;
    this.name = name;
    this.systemPrompt = systemPrompt;
  }

  async analyze(input: string): Promise<AgentResponse> {
    try {
      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        temperature: 0.7,
        system: this.systemPrompt,
        messages: [
          {
            role: 'user',
            content: input
          }
        ]
      });

      const content = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';

      // Parse the response to extract structured data
      const parsed = this.parseResponse(content);

      return {
        role: this.role,
        name: this.name,
        assessment: parsed.assessment,
        confidence: parsed.confidence,
        keyFindings: parsed.keyFindings,
        recommendations: parsed.recommendations,
      };
    } catch (error) {
      console.error(`Error in ${this.role} agent:`, error);
      throw error;
    }
  }

  private parseResponse(content: string): {
    assessment: string;
    confidence: number;
    keyFindings: string[];
    recommendations: string[];
  } {
    // Extract assessment (first paragraph or section)
    const assessmentMatch = content.match(/Assessment[:\s]+([^\n]+(?:\n(?!Confidence|Key Findings|Recommendations)[^\n]+)*)/i);
    const assessment = assessmentMatch 
      ? assessmentMatch[1].trim() 
      : content.split('\n\n')[0].trim();

    // Extract confidence percentage
    const confidenceMatch = content.match(/Confidence[:\s]+(\d+)%?/i);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 75;

    // Extract key findings (bullet points or numbered list)
    const findingsSection = content.match(/Key Findings?[:\s]+((?:[-•\d.]\s*[^\n]+\n?)+)/i);
    const keyFindings = findingsSection
      ? findingsSection[1]
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^[-•\d.]\s*/, '').trim())
          .filter(line => line.length > 0)
      : [];

    // Extract recommendations (bullet points or numbered list)
    const recommendationsSection = content.match(/Recommendations?[:\s]+((?:[-•\d.]\s*[^\n]+\n?)+)/i);
    const recommendations = recommendationsSection
      ? recommendationsSection[1]
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^[-•\d.]\s*/, '').trim())
          .filter(line => line.length > 0)
      : [];

    return {
      assessment,
      confidence: Math.min(Math.max(confidence, 0), 100),
      keyFindings: keyFindings.slice(0, 5),
      recommendations: recommendations.slice(0, 4),
    };
  }
}

// Create specialist agents
const diagnosticAgent = new SpecialistAgent(
  'Diagnostic AI',
  'AI Diagnostic System',
  AGENT_PROMPTS.diagnostic
);

const dermatologistAgent = new SpecialistAgent(
  'Dermatologist',
  'Dr. Sarah Chen',
  AGENT_PROMPTS.dermatologist
);

const pathologistAgent = new SpecialistAgent(
  'Pathologist',
  'Dr. James Wilson',
  AGENT_PROMPTS.pathologist
);

const treatmentAgent = new SpecialistAgent(
  'Treatment Specialist',
  'Dr. Maria Rodriguez',
  AGENT_PROMPTS.treatment
);

const riskAgent = new SpecialistAgent(
  'Risk Assessment',
  'Dr. David Kim',
  AGENT_PROMPTS.risk
);

// Coordinator agent with special synthesis logic
async function coordinateConsensus(
  specialists: AgentResponse[],
  diagnosisResult: DiagnosisResult
): Promise<{
  diagnosis: string;
  confidence: number;
  summary: string;
  urgency: 'low' | 'medium' | 'high' | 'immediate';
}> {
  const coordinatorInput = `
ORIGINAL DIAGNOSIS: ${diagnosisResult.diagnosis}

SPECIALIST OPINIONS:
${specialists.map(s => `
${s.name} (${s.role}):
- Assessment: ${s.assessment}
- Confidence: ${s.confidence}%
- Key Findings: ${s.keyFindings.join('; ')}
- Recommendations: ${s.recommendations.join('; ')}
`).join('\n')}

Based on all specialist inputs, provide:
1. Consensus diagnosis
2. Overall confidence level (0-100)
3. Brief summary (2-3 sentences)
4. Urgency level (low/medium/high/immediate)

Format your response clearly with these sections.
`;

  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    temperature: 0.7,
    system: AGENT_PROMPTS.coordinator,
    messages: [
      {
        role: 'user',
        content: coordinatorInput
      }
    ]
  });

  const content = response.content[0].type === 'text' 
    ? response.content[0].text 
    : '';

  // Parse coordinator response
  const diagnosisMatch = content.match(/(?:Consensus )?Diagnosis[:\s]+([^\n]+)/i);
  const diagnosis = diagnosisMatch ? diagnosisMatch[1].trim() : diagnosisResult.diagnosis;

  const confidenceMatch = content.match(/Confidence[:\s]+(\d+)%?/i);
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : diagnosisResult.confidence;

  const summaryMatch = content.match(/Summary[:\s]+([^\n]+(?:\n(?!Urgency)[^\n]+)*)/i);
  const summary = summaryMatch 
    ? summaryMatch[1].trim() 
    : `Multiple specialists have reviewed the case and reached consensus on ${diagnosis}.`;

  const urgencyMatch = content.match(/Urgency[:\s]+(low|medium|high|immediate)/i);
  const urgency = (urgencyMatch ? urgencyMatch[1].toLowerCase() : 'medium') as 'low' | 'medium' | 'high' | 'immediate';

  return { diagnosis, confidence, summary, urgency };
}

// Main consultation orchestrator
export async function runMultiAgentConsultation(
  diagnosisResult: DiagnosisResult,
  patientContext?: PatientContext
): Promise<ConsultationResponse> {
  const startTime = Date.now();

  try {
    // Format input for all agents
    const input = formatInputForAgent(diagnosisResult, patientContext);

    // Run all specialist agents in parallel
    console.log('Running multi-agent consultation...');
    const specialistResults = await Promise.all([
      diagnosticAgent.analyze(input),
      dermatologistAgent.analyze(input),
      pathologistAgent.analyze(input),
      treatmentAgent.analyze(input),
      riskAgent.analyze(input),
    ]);

    console.log('Specialists completed. Coordinating consensus...');

    // Coordinator synthesizes all opinions
    const consensus = await coordinateConsensus(specialistResults, diagnosisResult);

    // Calculate agreement score (based on confidence variance)
    const confidences = specialistResults.map(r => r.confidence);
    const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - avgConfidence, 2), 0) / confidences.length;
    const agreementScore = Math.max(0, 100 - Math.sqrt(variance));

    const processingTime = Date.now() - startTime;

    return {
      consensus,
      specialists: specialistResults,
      agreementScore: Math.round(agreementScore),
      processingTime,
    };
  } catch (error) {
    console.error('Error in multi-agent consultation:', error);
    throw error;
  }
}
