document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('themeToggleButton');
    const totalTanksElement = document.getElementById('totalTanks');
    const activeAlertsElement = document.getElementById('activeAlerts');
    const criticalTanksElement = document.getElementById('criticalTanks');
    const avgConductivityElement = document.getElementById('avgConductivity');
    const lastUpdatedElement = document.getElementById('lastUpdated');
    const recentAlertsList = document.getElementById('recentAlertsList');
    const recentActivityList = document.getElementById('recentActivityList');

    // --- Lógica do Tema (Modo Escuro/Claro) ---
    const applyTheme = (isDarkMode) => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            themeToggleButton.innerHTML = '<i class="fas fa-sun"></i> ';
        } else {
            document.body.classList.remove('dark-mode');
            themeToggleButton.innerHTML = '<i class="fas fa-moon"></i> ';
        }
    };

    // Carregar preferência de tema do localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        applyTheme(true);
    } else {
        applyTheme(false); // Padrão para modo claro se não houver preferência
    }

    // Alternar tema ao clicar no botão
    themeToggleButton.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        applyTheme(!isDarkMode);
        localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
    });

    // --- Lógica de Carregamento de Dados Simulados (Substituindo o Backend PHP) ---
    const loadAdminData = async () => {
        try {
            // Simular dados de estatísticas
            const statsData = {
                totalTanks: 4,
                activeAlerts: 3,
                criticalTanks: 1,
                avgConductivity: 520, // µS/cm
                lastUpdated: new Date().toLocaleString('pt-BR'),
            };

            totalTanksElement.textContent = statsData.totalTanks;
            activeAlertsElement.textContent = statsData.activeAlerts;
            criticalTanksElement.textContent = statsData.criticalTanks;
            avgConductivityElement.textContent = `${statsData.avgConductivity} µS/cm`;
            lastUpdatedElement.textContent = statsData.lastUpdated;

            // Simular dados de Alertas Recentes
            const alertsData = {
                recentAlerts: [
                    { type: 'Crítico', message: 'Condutividade Crítica! Valor: 1300 µS/cm. Ação imediata necessária!', tank: 'Tanque 3', timestamp: '12/07/2025 10:30', icon: 'fas fa-exclamation-circle' },
                    { type: 'Atenção', message: 'Condutividade em Atenção! Valor: 580 µS/cm. Monitore de perto e verifique a qualidade da água.', tank: 'Tanque 2', timestamp: '14/07/2025 09:45', icon: 'fas fa-exclamation-triangle' },
                    { type: 'Preditivo', message: 'Consumo de oxigênio em Atenção! Monitore de perto', tank: 'Tanque 2', timestamp: '13/07/2025 18:00', icon: 'fas fa-lightbulb' },
                ]
            };

            recentAlertsList.innerHTML = ''; // Limpa a lista existente
            if (alertsData.recentAlerts && alertsData.recentAlerts.length > 0) {
                alertsData.recentAlerts.forEach(alert => {
                    const alertItem = document.createElement('div');
                    alertItem.classList.add('alert-item');
                    if (alert.type === 'Preditivo' || alert.type === 'Atenção') {
                        alertItem.classList.add('predictive');
                    }
                    alertItem.innerHTML = `
                        <i class="${alert.icon} icon"></i>
                        <div>
                            <strong>${alert.type}:</strong> ${alert.message} <br>
                            <small>Tanque: ${alert.tank} (${alert.timestamp})</small>
                        </div>
                    `;
                    recentAlertsList.appendChild(alertItem);
                });
            } else {
                recentAlertsList.innerHTML = '<p class="no-alerts">Nenhum alerta recente.</p>';
            }

            // Simular dados de Atividade Recente
            const activityData = {
                recentActivity: [
                    { type: 'Manutenção', message: 'Limpeza de filtro no Tanque 2.', timestamp: '14/07/2025 11:00', icon: 'fas fa-tools' },
                    { type: 'Configuração', message: 'Parâmetros de pH ajustados no Tanque 4.', timestamp: '13/07/2025 14:15', icon: 'fas fa-sliders-h' },
                    { type: 'Alimentação', message: 'Alimentação manual realizada no Tanque Principal.', timestamp: '13/07/2025 08:30', icon: 'fas fa-fish' },
                ]
            };

            recentActivityList.innerHTML = ''; // Limpa a lista existente
            if (activityData.recentActivity && activityData.recentActivity.length > 0) {
                activityData.recentActivity.forEach(activity => {
                    const activityItem = document.createElement('div');
                    activityItem.classList.add('alert-item'); // Reutiliza o estilo de item de alerta
                    activityItem.innerHTML = `
                        <i class="${activity.icon} icon"></i>
                        <div>
                            <strong>${activity.type}:</strong> ${activity.message} <br>
                            <small>Data: ${activity.timestamp}</small>
                        </div>
                    `;
                    recentActivityList.appendChild(activityItem);
                });
            } else {
                recentActivityList.innerHTML = '<p class="no-activity">Nenhuma atividade recente.</p>';
            }

        } catch (error) {
            console.error('Erro ao carregar dados do administrador:', error);
            // Mostrar uma mensagem de erro na UI
            totalTanksElement.textContent = 'Erro';
            activeAlertsElement.textContent = 'Erro';
            criticalTanksElement.textContent = 'Erro';
            avgConductivityElement.textContent = 'Erro';
            lastUpdatedElement.textContent = 'Erro';
            recentAlertsList.innerHTML = '<p class="no-alerts error-message">Erro ao carregar alertas.</p>';
            recentActivityList.innerHTML = '<p class="no-activity error-message">Erro ao carregar atividades.</p>';
        }
    };

    // Carregar dados ao carregar a página
    loadAdminData();
});