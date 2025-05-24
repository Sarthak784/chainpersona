function exportAsPDF() {
  if (!currentPersonaData) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Add watermark function
  function addWatermark() {
    doc.setGState(new doc.GState({opacity: 0.1}));
    doc.setFontSize(60);
    doc.setTextColor(200, 200, 200);
    doc.text('ChainPersona', pageWidth/2, pageHeight/2, {
      angle: 45,
      align: 'center'
    });
    doc.setGState(new doc.GState({opacity: 1}));
  }
  
  // Add header function
  function addHeader() {
    // Logo/Brand area
    doc.setFillColor(78, 84, 200);
    doc.rect(0, 0, pageWidth, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ChainPersona AI', margin, 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Web3 Wallet Intelligence Engine', pageWidth - margin, 10, { align: 'right' });
  }
  
  // Add footer function
  function addFooter(pageNum) {
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(8);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, pageHeight - 10);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    doc.text('chainpersona.ai', pageWidth/2, pageHeight - 10, { align: 'center' });
  }
  
  // Page 1: Wallet Overview
  addWatermark();
  addHeader();
  
  let yPos = 25;
  
  // Title
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Wallet Analysis Report', margin, yPos);
  yPos += 15;
  
  // Wallet Info Box
  doc.setFillColor(240, 248, 255);
  doc.setDrawColor(78, 84, 200);
  doc.rect(margin, yPos, contentWidth, 25, 'FD');
  
  yPos += 8;
  doc.setTextColor(78, 84, 200);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Wallet Address:', margin + 5, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(currentPersonaData.address, margin + 35, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Blockchain:', margin + 5, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(currentChain.toUpperCase(), margin + 25, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Portfolio Value:', margin + 5, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(document.getElementById('portfolio-value').textContent, margin + 32, yPos);
  
  yPos += 15;
  
  // Key Metrics Section
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Metrics', margin, yPos);
  yPos += 10;
  
  // Metrics table
  const metricsData = [
    ['Activity Level', `${currentPersonaData.activityLevel}%`],
    ['Security Score', `${currentPersonaData.securityScore}%`],
    ['Risk Score', `${currentPersonaData.riskScore}%`],
    ['Transaction Pattern', document.getElementById('pattern-description').textContent]
  ];
  
  metricsData.forEach(([label, value]) => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(78, 84, 200);
    doc.text(label + ':', margin, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(44, 62, 80);
    doc.text(value, margin + 40, yPos);
    yPos += 7;
  });
  
  yPos += 10;
  
  // Persona Archetypes Section
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Persona Archetypes', margin, yPos);
  yPos += 10;
  
  const sortedArchetypes = Object.entries(currentPersonaData.archetypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  sortedArchetypes.forEach(([archetype, percentage]) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(44, 62, 80);
    doc.text(`${archetype}:`, margin + 5, yPos);
    doc.text(`${percentage}%`, margin + 80, yPos);
    
    // Progress bar
    doc.setFillColor(240, 240, 240);
    doc.rect(margin + 90, yPos - 3, 80, 4, 'F');
    doc.setFillColor(78, 84, 200);
    doc.rect(margin + 90, yPos - 3, (80 * percentage / 100), 4, 'F');
    
    yPos += 8;
  });
  
  addFooter(1);
  
  // Page 2: Protocols & Recommendations
  doc.addPage();
  addWatermark();
  addHeader();
  
  yPos = 25;
  
  // Top Protocols Section
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Protocols', margin, yPos);
  yPos += 10;
  
  currentPersonaData.topProtocols.forEach((protocol, index) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(78, 84, 200);
    doc.text(`${index + 1}.`, margin, yPos);
    doc.setTextColor(44, 62, 80);
    doc.text(protocol, margin + 8, yPos);
    yPos += 6;
  });
  
  yPos += 10;
  
  // Behavioral Traits Section
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Behavioral Traits', margin, yPos);
  yPos += 10;
  
  currentPersonaData.behavioralTraits.forEach(trait => {
    doc.setFillColor(240, 248, 255);
    doc.setDrawColor(78, 84, 200);
    const textWidth = doc.getTextWidth(trait) + 6;
    doc.rect(margin, yPos - 4, textWidth, 6, 'FD');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(78, 84, 200);
    doc.text(trait, margin + 3, yPos);
    yPos += 10;
  });
  
  yPos += 10;
  
  // Standard Recommendations Section
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Standard Recommendations', margin, yPos);
  yPos += 10;
  
  currentPersonaData.recommendedDapps.forEach((dapp, index) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 193, 7);
    doc.text('★', margin, yPos);
    doc.setTextColor(44, 62, 80);
    doc.text(dapp, margin + 8, yPos);
    yPos += 6;
  });
  
  yPos += 10;
  
  // AI Recommendations Section
  if (currentPersonaData.aiInsights && currentPersonaData.aiInsights.recommendations) {
    doc.setTextColor(255, 107, 107);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Recommendations', margin, yPos);
    yPos += 10;
    
    currentPersonaData.aiInsights.recommendations.forEach((rec, index) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 107, 107);
      doc.text('🤖', margin, yPos);
      doc.setTextColor(44, 62, 80);
      doc.text(rec, margin + 8, yPos);
      yPos += 6;
    });
  }
  
  addFooter(2);
  
  // Page 3: AI Insights & Security
  if (currentPersonaData.aiInsights) {
    doc.addPage();
    addWatermark();
    addHeader();
    
    yPos = 25;
    
    // AI Insights Section
    doc.setTextColor(255, 107, 107);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Intelligence Report', margin, yPos);
    yPos += 15;
    
    // Trading Style
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Trading Style Analysis', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const tradingStyle = currentPersonaData.aiInsights.tradingStyle || 'Analysis in progress...';
    const tradingLines = doc.splitTextToSize(tradingStyle, contentWidth - 10);
    doc.text(tradingLines, margin + 5, yPos);
    yPos += tradingLines.length * 5 + 8;
    
    // Risk Tolerance
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Risk Tolerance Profile', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const riskTolerance = currentPersonaData.aiInsights.riskTolerance || 'Assessment pending...';
    const riskLines = doc.splitTextToSize(riskTolerance, contentWidth - 10);
    doc.text(riskLines, margin + 5, yPos);
    yPos += riskLines.length * 5 + 8;
    
    // DeFi Sophistication
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DeFi Sophistication Level', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const defiSoph = currentPersonaData.aiInsights.defiSophistication || 'Evaluation in progress...';
    const defiLines = doc.splitTextToSize(defiSoph, contentWidth - 10);
    doc.text(defiLines, margin + 5, yPos);
    yPos += defiLines.length * 5 + 15;
    
    // Security Analysis
    if (currentPersonaData.securityAnalysis) {
      doc.setTextColor(17, 153, 142);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Security Analysis', margin, yPos);
      yPos += 10;
      
      const threatLevel = currentPersonaData.securityAnalysis.threatLevel || 'Medium';
      const secScore = currentPersonaData.securityAnalysis.securityScore || currentPersonaData.securityScore;
      
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.text(`Threat Level: ${threatLevel}`, margin + 5, yPos);
      yPos += 7;
      doc.text(`Security Score: ${secScore}/100`, margin + 5, yPos);
      yPos += 10;
      
      if (currentPersonaData.securityAnalysis.recommendations) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Security Recommendations:', margin + 5, yPos);
        yPos += 7;
        
        currentPersonaData.securityAnalysis.recommendations.forEach(rec => {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(`• ${rec}`, margin + 10, yPos);
          yPos += 5;
        });
      }
    }
    
    addFooter(3);
  }
  
  // Save the PDF
  doc.save(`chainpersona_ai_${currentPersonaData.address.substring(0, 6)}.pdf`);
}
