document.addEventListener('DOMContentLoaded', () => {
    const valorCondutividadeElement = document.getElementById('valorCondutividade');
    const statusCondutividadeIndicator = document.getElementById('statusCondutividade');
    const textoStatusCondutividadeElement = document.getElementById('textoStatusCondutividade');
    const listaAlertasTanqueElement = document.getElementById('listaAlertasTanque');
    const tankNameElement = document.getElementById('tankName');
    const tankSpeciesElement = document.getElementById('tankSpecies');
    const tankCapacityElement = document.getElementById('tankCapacity');
    const btnReiniciarDemo = document.getElementById('btnReiniciarDemo');

    const urlParams = new URLSearchParams(window.location.search);
    const tanqueId = parseInt(urlParams.get('tanque_id')) || 1; // Padrão para 1
    let tanqueNome = urlParams.get('nome') || `Tanque ${tanqueId}`;

    const pageTitleElement = document.querySelector('title');
    if (pageTitleElement) {
        pageTitleElement.textContent = `AquaSense Pro - Detalhes do ${decodeURIComponent(tanqueNome)}`;
    }

    const backButton = document.getElementById('backButton');
    backButton.href = `painel_controle.html`; // Ajustado para voltar ao painel de controle geral

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
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Condutividade (µS/cm)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Tempo'
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        }
    };
    condutividadeChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: chartOptions
    });

    const LIMITE_NORMAL_MAX = 500;
    const LIMITE_CRITICO = 1200;

    // --- Dados Simulados para substituir o Backend ---
    let simulatedDatabase = {
        tanks: [
            {
                tanque_id: 1,
                nome: "Tanque Principal",
                especie: "Tilápia",
                capacidade: "200m³",
                condutividade: 450,
                ph: 7.2,
                oxigenio: 6.8,
                temperatura: 26.5,
                history: [],
                alerts: []
            },
            {
                tanque_id: 2,
                nome: "Tanque Secundário",
                especie: "Pacu",
                capacidade: "150m³",
                condutividade: 580, // Atenção
                ph: 6.9,
                oxigenio: 5.5,
                temperatura: 27.1,
                history: [],
                // ALERTA INICIAL PARA TANQUE 2 - MAIS DETALHADO
                alerts: [{
                    id: 101, // ID único para alerta inicial
                    tanque_id: 2,
                    tipo_alerta: 'Preditivo',
                    mensagem: `Condutividade em Atenção! Valor: 580 µS/cm. Monitore de perto e verifique a qualidade da água.`,
                    timestamp: new Date().toISOString()
                }]
            },
            {
                tanque_id: 3,
                nome: "Tanque Experimental",
                especie: "Tambaqui",
                capacidade: "100m³",
                condutividade: 1300, // Crítico
                ph: 7.5,
                oxigenio: 7.2,
                temperatura: 25.9,
                history: [],
                // ALERTA INICIAL PARA TANQUE 3 - MAIS DETALHADO
                alerts: [{
                    id: 102, // ID único para alerta inicial
                    tanque_id: 3,
                    tipo_alerta: 'Crítico',
                    mensagem: `Condutividade Crítica! Valor: 1300 µS/cm. Ação imediata necessária: verifique o sistema de filtragem.`,
                    timestamp: new Date().toISOString()
                }]
            },
            {
                tanque_id: 4,
                nome: "Tanque de Quarentena",
                especie: "Aruanã",
                capacidade: "50m³",
                condutividade: 300,
                ph: 7.0,
                oxigenio: 6.5,
                temperatura: 26.0,
                history: [],
                alerts: []
            }
        ],
        nextAlertId: 200 // Para garantir IDs de alerta únicos a partir daqui (após os iniciais)
    };

    // Preenche o histórico inicial de cada tanque
    simulatedDatabase.tanks.forEach(tank => {
        if (tank.history.length === 0) { // Garante que só preenche se o histórico estiver vazio
            for (let i = 0; i < 30; i++) {
                const timeOffset = 30 - i; // Dados mais antigos primeiro
                const timestamp = new Date(Date.now() - timeOffset * 300 * 1000).toISOString(); // Ajuste para 5 minutos de intervalo inicial
                let initialCond = tank.condutividade + (Math.random() * 50 - 25);
                if (initialCond < 100) initialCond = 100;
                if (initialCond > 1500) initialCond = 1500;
                tank.history.push({ timestamp: timestamp, condutividade: initialCond });
            }
        }
    });

    // Função para gerar dados aleatórios com uma variação
    function generateRandomData(currentValue, minChange, maxChange) {
        return parseFloat((currentValue + (Math.random() * (maxChange - minChange) + minChange)).toFixed(2));
    }

    // Função para simular atualização de dados e gerar alertas
    function simulateDataUpdate(tank) {
        // Atualiza condutividade
        tank.condutividade = generateRandomData(tank.condutividade, -10, 10);
        if (tank.condutividade < 100) tank.condutividade = 100;
        if (tank.condutividade > 1500) tank.condutividade = 1500;

        // Adiciona ao histórico (limita o tamanho do histórico)
        const timestamp = new Date().toISOString();
        tank.history.push({ timestamp: timestamp, condutividade: tank.condutividade });
        if (tank.history.length > 60) { // Mantém as últimas 60 entradas (aprox. 5 horas de dados)
            tank.history.shift();
        }

        // Verifica novos alertas
        let newAlert = null;
        const hasCriticalAlert = tank.alerts.some(a => a.tipo_alerta === 'Crítico');
        const hasPredictiveAlert = tank.alerts.some(a => a.tipo_alerta === 'Preditivo');

        if (tank.condutividade > LIMITE_CRITICO && !hasCriticalAlert) {
            newAlert = {
                id: simulatedDatabase.nextAlertId++,
                tanque_id: tank.tanque_id,
                tipo_alerta: 'Crítico',
                // MENSAGEM MAIS DETALHADA
                mensagem: `Condutividade Crítica! Valor: ${tank.condutividade} µS/cm. Ação imediata necessária: verifique o sistema de filtragem.`,
                timestamp: timestamp
            };
        } else if (tank.condutividade > LIMITE_NORMAL_MAX && tank.condutividade <= LIMITE_CRITICO && !hasPredictiveAlert) {
            newAlert = {
                id: simulatedDatabase.nextAlertId++,
                tanque_id: tank.tanque_id,
                tipo_alerta: 'Preditivo',
                // MENSAGEM MAIS DETALHADA
                mensagem: `Condutividade em Atenção! Valor: ${tank.condutividade} µS/cm. Monitore de perto e verifique a qualidade da água.`,
                timestamp: timestamp
            };
        } else if (tank.condutividade <= LIMITE_NORMAL_MAX && (hasCriticalAlert || hasPredictiveAlert)) {
             // Se voltar ao normal, remove alertas existentes para condutividade
            tank.alerts = tank.alerts.filter(a => a.tipo_alerta !== 'Crítico' && a.tipo_alerta !== 'Preditivo');
            // Também remove do set de alertas falados
            alertasFalados.forEach(alertId => {
                // Remove apenas alertas de condutividade para este tanque
                if (alertId.toString().startsWith(`${tank.tanque_id}-condutividade`)) {
                    alertasFalados.delete(alertId);
                }
            });
        }


        if (newAlert) {
            tank.alerts.push(newAlert);
        }
    }
    // --- Fim Dados Simulados ---

    // --- Variáveis e Função de Alerta por Voz ---
    let alertasFalados = new Set();

    // NOVO: Recupera o estado da voz do localStorage
    let isVoiceEnabled = localStorage.getItem('voiceEnabled') === 'true';

    function falarAlerta(texto, alertIdForSpeech) {
        // VERIFICA SE A VOZ ESTÁ ATIVADA E SE O ALERTA JÁ NÃO FOI FALADO
        if (isVoiceEnabled && 'speechSynthesis' in window && !alertasFalados.has(alertIdForSpeech)) {
            const utterance = new SpeechSynthesisUtterance(texto);
            utterance.lang = 'pt-BR';
            utterance.rate = 1;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
            alertasFalados.add(alertIdForSpeech); // Marca como falado
        } else {
            console.warn('API de síntese de fala não suportada, voz desativada, ou alerta já falado.');
        }
    }
    // --- Fim Variáveis e Função de Alerta por Voz ---

    const fetchSensorData = async () => {
        // Simula o atraso da chamada de API
        await new Promise(resolve => setTimeout(resolve, 300));

        const currentTank = simulatedDatabase.tanks.find(t => t.tanque_id === tanqueId);

        if (currentTank) {
            tankNameElement.textContent = currentTank.nome;
            if (pageTitleElement) {
                pageTitleElement.textContent = `AquaSense Pro - Detalhes do ${currentTank.nome}`;
            }
            tankSpeciesElement.textContent = currentTank.especie;
            tankCapacityElement.textContent = currentTank.capacidade;

            const condutividade = parseFloat(currentTank.condutividade).toFixed(2);
            valorCondutividadeElement.textContent = `${condutividade} µS/cm`;

            if (condutividade <= LIMITE_NORMAL_MAX) {
                statusCondutividadeIndicator.className = 'status-indicator green';
                textoStatusCondutividadeElement.textContent = 'Normal';
            } else if (condutividade <= LIMITE_CRITICO) {
                statusCondutividadeIndicator.className = 'status-indicator yellow';
                textoStatusCondutividadeElement.textContent = 'Atenção!';
            } else {
                statusCondutividadeIndicator.className = 'status-indicator red';
                textoStatusCondutividadeElement.textContent = 'Crítico!';
            }
        } else {
            tankNameElement.textContent = 'Não Encontrado';
            tankSpeciesElement.textContent = 'N/A';
            tankCapacityElement.textContent = 'N/A';
            valorCondutividadeElement.textContent = '--';
            statusCondutividadeIndicator.className = 'status-indicator unknown';
            textoStatusCondutividadeElement.textContent = 'Tanque não encontrado!';
        }
    };

    const fetchHistoricalData = async () => {
        // Simula o atraso da chamada de API
        await new Promise(resolve => setTimeout(resolve, 300));

        const currentTank = simulatedDatabase.tanks.find(t => t.tanque_id === tanqueId);

        if (currentTank && currentTank.history) {
            chartData.labels = [];
            chartData.datasets[0].data = [];

            currentTank.history.forEach(item => {
                chartData.labels.push(new Date(item.timestamp).toLocaleTimeString());
                chartData.datasets[0].data.push(parseFloat(item.condutividade));
            });
            condutividadeChart.update();
        }
    };

    const fetchAlertsTanque = async () => {
        // Simula o atraso da chamada de API
        await new Promise(resolve => setTimeout(resolve, 300));

        const currentTank = simulatedDatabase.tanks.find(t => t.tanque_id === tanqueId);

        listaAlertasTanqueElement.innerHTML = '';
        if (currentTank && currentTank.alerts && currentTank.alerts.length > 0) {
            currentTank.alerts.forEach(alert => {
                // O ID para fala é composto pelo ID do alerta para garantir unicidade
                const alertIdForSpeech = `${alert.tanque_id}-${alert.id}`;
                falarAlerta(`Alerta ${alert.tipo_alerta}: ${alert.mensagem}`, alertIdForSpeech);

                const alertItem = document.createElement('div');
                alertItem.className = `alert-item ${alert.tipo_alerta === 'Preditivo' ? 'predictive' : 'critical'}`;

                let iconClass = 'fas fa-info-circle';
                if (alert.tipo_alerta === 'Preditivo') {
                    iconClass = 'fas fa-bell';
                } else if (alert.tipo_alerta === 'Crítico') {
                    iconClass = 'fas fa-exclamation-circle';
                }
                const iconHtml = `<i class="${iconClass} icon"></i>`;

                alertItem.innerHTML = `
                    ${iconHtml}
                    <div class="alert-content">
                        <strong>${alert.tipo_alerta}:</strong> ${alert.mensagem}
                        <br><small>(${new Date(alert.timestamp).toLocaleString('pt-BR')})</small>
                    </div>
                    <button class="resolve-alert-button button" data-alert-id="${alert.id}">
                        <i class="fas fa-check-circle"></i> Resolver
                    </button>
                `;
                listaAlertasTanqueElement.appendChild(alertItem);
                alertItem.querySelector('.resolve-alert-button').addEventListener('click', handleResolveAlert);
            });
        } else {
            listaAlertasTanqueElement.innerHTML = '<p class="no-alerts">Nenhum alerta ativo para este tanque.</p>';
        }
    };

    const handleResolveAlert = async (event) => {
        const button = event.currentTarget;
        const alertId = parseInt(button.dataset.alertId);

        if (isNaN(alertId)) {
            console.error('ID do alerta inválido.');
            return;
        }

        button.disabled = true;
        button.textContent = 'Resolvendo...';
        button.classList.add('loading');

        // Simula o atraso da chamada de API
        await new Promise(resolve => setTimeout(resolve, 500));

        const currentTank = simulatedDatabase.tanks.find(t => t.tanque_id === tanqueId);

        if (currentTank) {
            const initialAlertCount = currentTank.alerts.length;
            currentTank.alerts = currentTank.alerts.filter(alert => alert.id !== alertId);
            if (currentTank.alerts.length < initialAlertCount) {
                alert('Alerta resolvido com sucesso!');
                // Remove do set de alertas falados, usando o mesmo ID composto
                alertasFalados.delete(`${currentTank.tanque_id}-${alertId}`);
                fetchAlertsTanque(); // Re-renderiza os alertas
            } else {
                alert('Alerta não encontrado ou já resolvido.');
            }
        } else {
            alert('Erro: Tanque não encontrado.');
        }

        button.disabled = false;
        button.textContent = 'Resolver';
        button.classList.remove('loading');
    };

    btnReiniciarDemo.addEventListener('click', async () => {
        if (confirm('Tem certeza que deseja reiniciar os dados da medição para este tanque? Isso apagará o histórico e alertas atuais.')) {
            // Simula o atraso da chamada de API
            await new Promise(resolve => setTimeout(resolve, 800));

            const currentTank = simulatedDatabase.tanks.find(t => t.tanque_id === tanqueId);

            if (currentTank) {
                currentTank.history = []; // Limpa o histórico
                currentTank.alerts = [];  // Limpa os alertas
                alertasFalados.clear(); // Limpa alertas falados globalmente ou de forma mais granular se o sistema tiver vários tanques

                // Reinicia o valor de condutividade para um valor inicial próximo ao padrão
                const originalTankData = { // Definir valores iniciais para reinício
                    1: 450,
                    2: 580,
                    3: 1300,
                    4: 300
                };
                currentTank.condutividade = originalTankData[currentTank.tanque_id] || 450;

                // Repopula o histórico inicial para o tanque atual
                for (let i = 0; i < 30; i++) {
                    const timeOffset = 30 - i;
                    const timestamp = new Date(Date.now() - timeOffset * 300 * 1000).toISOString(); // Ajuste para 5 minutos
                    let initialCond = currentTank.condutividade + (Math.random() * 50 - 25);
                    if (initialCond < 100) initialCond = 100;
                    if (initialCond > 1500) initialCond = 1500;
                    currentTank.history.push({ timestamp: timestamp, condutividade: initialCond });
                }

                // Recria alertas iniciais após reiniciar se o tanque tiver um alerta predefinido
                if (currentTank.tanque_id === 2) {
                    currentTank.alerts.push({
                        id: 101,
                        tanque_id: 2,
                        tipo_alerta: 'Preditivo',
                        mensagem: `Condutividade em Atenção! Valor: 580 µS/cm. Monitore de perto e verifique a qualidade da água.`,
                        timestamp: new Date().toISOString()
                    });
                } else if (currentTank.tanque_id === 3) {
                    currentTank.alerts.push({
                        id: 102,
                        tanque_id: 3,
                        tipo_alerta: 'Crítico',
                        mensagem: `Condutividade Crítica! Valor: 1300 µS/cm. Ação imediata necessária: verifique o sistema de filtragem.`,
                        timestamp: new Date().toISOString()
                    });
                }


                alert('Dados da medição reiniciados com sucesso para este tanque!');
                fetchSensorData();
                fetchHistoricalData();
                fetchAlertsTanque();
            } else {
                alert('Erro: Tanque não encontrado para reiniciar os dados.');
            }
        }
    });

    // Loop principal para simulação contínua de dados e atualizações de exibição
    setInterval(() => {
        const currentTank = simulatedDatabase.tanks.find(t => t.tanque_id === tanqueId);
        if (currentTank) {
            simulateDataUpdate(currentTank);
            // Chama as funções de fetch para atualizar a UI imediatamente após a simulação
            fetchSensorData();
            fetchHistoricalData();
            fetchAlertsTanque();
        }
    }, 300000); // Simula mudanças de dados a cada 5 minutos

    // Intervalos de busca (agora puxarão dos dados simulados) - Mantidos para consistência, mas o setInterval acima já fará o trabalho
    // setInterval(fetchSensorData, 300000);
    // setInterval(fetchAlertsTanque, 300000);
    // setInterval(fetchHistoricalData, 300000);

    // Buscas iniciais ao carregar a página
    fetchSensorData();
    fetchHistoricalData();
    fetchAlertsTanque();

    const themeToggleButton = document.getElementById('themeToggleButton');
    const body = document.body;

    function applyTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            body.classList.toggle('dark-mode', savedTheme === 'dark');
            themeToggleButton.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i> ' : '<i class="fas fa-moon"></i> ';
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // Se não há tema salvo, verifica a preferência do sistema
            body.classList.add('dark-mode');
            themeToggleButton.innerHTML = '<i class="fas fa-sun"></i> ';
            localStorage.setItem('theme', 'dark'); // Salva a preferência do sistema
        } else {
            themeToggleButton.innerHTML = '<i class="fas fa-moon"></i> ';
            localStorage.setItem('theme', 'light'); // Salva a preferência padrão
        }
    }
    applyTheme();
    themeToggleButton.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            themeToggleButton.innerHTML = '<i class="fas fa-sun"></i> ';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggleButton.innerHTML = '<i class="fas fa-moon"></i> ';
            localStorage.setItem('theme', 'light');
        }
    });
});