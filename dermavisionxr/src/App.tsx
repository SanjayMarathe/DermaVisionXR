import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ScanPage } from './components/ScanPage';
import { ReportPage } from './components/ReportPage';

type PageView = 'landing' | 'scan' | 'report';

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

function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('landing');
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);

  const handleViewReport = (data: ConsultationData) => {
    setConsultationData(data);
    setCurrentPage('report');
  };

  return (
    <>
      {currentPage === 'landing' && (
        <LandingPage onLaunch={() => setCurrentPage('scan')} />
      )}
      {currentPage === 'scan' && (
        <ScanPage 
          onBack={() => setCurrentPage('landing')} 
          onViewReport={handleViewReport}
        />
      )}
      {currentPage === 'report' && (
        <ReportPage 
          consultationData={consultationData} 
          onBack={() => setCurrentPage('scan')} 
        />
      )}
    </>
  );
}

export default App;
