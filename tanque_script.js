document.addEventListener('DOMContentLoaded', () => {
  const valorCondutividadeElement = document.getElementById('valorCondutividade');
  const statusCondutividadeIndicator = document.getElementById('statusCondutividade');
  const textoStatusCondutividadeElement = document.getElementById('textoStatusCondutividade');
  const listaAlertasTanqueElement = document.getElementById('listaAlertasTanque');
  const tankNameElement = document.getElementById('tankName');

  const urlParams = new URLSearchParams(window.location.search);
  const tanqueId = parseInt(urlParams.get('tanque_id')) || 1;
  const tanqueNome = urlParams.get('nome') || `Tanque ${tanqueId}`;
  tankNameElement.textContent = tanqueNome;

  const backButton = document.getElementById('backButton');
  backButton.href = `condutividade.html?tanque_id=${tanqueId}&nome=${encodeURIComponent(tanqueNome)}`;

  // Simulações (puxe do mesmo escopo usado no das_script.js)
  const getSimulatedTank = () => TANQUES_SIMULADOS.find(t => t.tanque_id == tanqueId);
  const getSimulatedHistory = () => HISTORICO_SIMULADO[tanqueId] || [];

  // Limites
  const LIMITE_NORMAL_MAX = 500;
  const LIMITE_CRITICO = 1200;

  // Chart.js
  let condutividadeChart;
  const ctx = document.getElementById('condutividadeChart').getContext('2d');
  const chartData = {
    labels: [],
    datasets: [{
      label: 'Condutividade Elétrica (µS/cm)',
      data: [],
      borderColor: '#2980b9',
      backgroundColor: 'rgba(41, 128, 185, 0.2)',
      fill: true,
      tension: 0.3
    }]
  };
  condutividadeChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Condutividade (µS/cm)' }
        },
        x: {
          title: { display: true, text: 'Tempo' }
        }
      }
    }
  });

  function atualizarCondutividade() {
    const tank = getSimulatedTank();
    if (!tank) {
      valorCondutividadeElement.textContent = '--';
      textoStatusCondutividadeElement.textContent = 'Tanque não encontrado';
      statusCondutividadeIndicator.className = 'status-indicator unknown';
      return;
    }

    const cond = parseFloat(tank.condutividade).toFixed(2);
    valorCondutividadeElement.textContent = `${cond} µS/cm`;

    if (cond >= LIMITE_CRITICO) {
      statusCondutividadeIndicator.className = 'status-indicator red';
      textoStatusCondutividadeElement.textContent = 'Crítico!';
    } else if (cond > LIMITE_NORMAL_MAX) {
      statusCondutividadeIndicator.className = 'status-indicator yellow';
      textoStatusCondutividadeElement.textContent = 'Atenção!';
    } else {
      statusCondutividadeIndicator.className = 'status-indicator green';
      textoStatusCondutividadeElement.textContent = 'Normal';
    }
  }

  function atualizarHistorico() {
    const historico = getSimulatedHistory();
    chartData.labels = historico.map(e => new Date(e.timestamp).toLocaleTimeString());
    chartData.datasets[0].data = historico.map(e => e.condutividade);
    condutividadeChart.update();
  }

  function gerarAlertasSimulados() {
    const tank = getSimulatedTank();
    listaAlertasTanqueElement.innerHTML = '';

    if (!tank || tank.condutividade == null) {
      listaAlertasTanqueElement.innerHTML = '<p class="no-alerts">Nenhum alerta ativo para este tanque.</p>';
      return;
    }

    const cond = tank.condutividade;
    let tipo = '';
    let mensagem = '';

    if (cond >= LIMITE_CRITICO) {
      tipo = 'Crítico';
      mensagem = `Condutividade muito alta (${cond} µS/cm)!`;
    } else if (cond > LIMITE_NORMAL_MAX) {
      tipo = 'Preditivo';
      mensagem = `Condutividade acima do ideal (${cond} µS/cm).`;
    }

    if (tipo) {
      const alerta = document.createElement('div');
      alerta.className = `alert-item ${tipo === 'Crítico' ? 'critical' : 'predictive'}`;
      alerta.innerHTML = `
        <i class="fas ${tipo === 'Crítico' ? 'fa-exclamation-circle' : 'fa-bell'} icon"></i>
        <div class="alert-content">
          <strong>${tipo}:</strong> ${mensagem}
          <br><small>(${new Date().toLocaleString('pt-BR')})</small>
        </div>
        <button class="resolve-alert-button button"><i class="fas fa-check-circle"></i> Resolver</button>
      `;

      alerta.querySelector('.resolve-alert-button').addEventListener('click', () => {
        alerta.remove();
        if (!listaAlertasTanqueElement.querySelector('.alert-item')) {
          listaAlertasTanqueElement.innerHTML = '<p class="no-alerts">Nenhum alerta ativo para este tanque.</p>';
        }
      });

      listaAlertasTanqueElement.appendChild(alerta);
    } else {
      listaAlertasTanqueElement.innerHTML = '<p class="no-alerts">Nenhum alerta ativo para este tanque.</p>';
    }
  }

  // Atualização periódica
  setInterval(() => {
    atualizarCondutividade();
    gerarAlertasSimulados();
  }, 3000);

  setInterval(atualizarHistorico, 10000);

  // Primeira renderização
  atualizarCondutividade();
  atualizarHistorico();
  gerarAlertasSimulados();

  // Tema
  const themeToggleButton = document.getElementById('themeToggleButton');
  const body = document.body;

  function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      body.classList.toggle('dark-mode', savedTheme === 'dark');
      themeToggleButton.textContent = savedTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro';
    } else {
      themeToggleButton.textContent = 'Modo Escuro';
    }
  }

  applyTheme();

  themeToggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    themeToggleButton.textContent = isDark ? 'Modo Claro' : 'Modo Escuro';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
});
