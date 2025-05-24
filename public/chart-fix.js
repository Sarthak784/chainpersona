function createDistributionChart(persona) {
  const isDarkTheme = document.body.classList.contains('dark-theme');
  const textColor = isDarkTheme ? '#ffffff' : '#2c3e50';
  
  const archetypes = Object.entries(persona.archetypes).filter(([_, value]) => value > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const labels = archetypes.map(([name, _]) => name);
  const data = archetypes.map(([_, value]) => value);
  
  // Better color scheme for pie chart
  const colors = [
    'rgba(78, 84, 200, 0.8)',   // Primary blue
    'rgba(255, 107, 107, 0.8)', // Coral red
    'rgba(0, 255, 242, 0.8)',   // Cyan
    'rgba(255, 193, 7, 0.8)',   // Golden yellow
    'rgba(138, 43, 226, 0.8)',  // Blue violet
    'rgba(255, 99, 132, 0.8)',  // Pink
    'rgba(54, 162, 235, 0.8)'   // Light blue
  ];
  
  const ctx = document.getElementById('categoryDistribution').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 3,
        borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.8)',
        hoverBorderWidth: 4,
        hoverBorderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Persona Archetype Distribution',
          color: textColor,
          font: {
            family: "'Rajdhani', sans-serif",
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          position: 'right',
          labels: {
            color: textColor,
            font: {
              family: "'Rajdhani', sans-serif",
              size: 12
            },
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: isDarkTheme ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: isDarkTheme ? '#00fff2' : '#4e54c8',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return context.label + ': ' + context.parsed + '%';
            }
          }
        }
      },
      cutout: '60%',
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1000
      }
    }
  });
}
