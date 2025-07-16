document.addEventListener('DOMContentLoaded', () => {
    const tanqueSelect = document.getElementById('tanqueSelect');
    const parametroSelect = document.getElementById('parametroSelect');
    const btnCarregar = document.getElementById('btnCarregar');
    const graficoCanvas = document.getElementById('graficoAnual');
    const sugestaoManejoDiv = document.getElementById('sugestaoManejo');
    const themeToggleButton = document.getElementById('themeToggleButton');
    const body = document.body;
    const btnExportPdf = document.getElementById('btnExportPdf'); 

    let currentChart; 
    let currentDataForPdf = []; 
    let currentParametroName = ''; 

    // --- DADOS SIMULADOS PARA SUBSTITUIR O BACKEND PHP ---
    // Estes dados simulam o que viria do 'das_get_dados.php'
    let simulatedTankData = [
      {
        tanque_id: 1,
        nome: "Tanque Principal",
        especie: "Tilápia",
        capacidade: "200m³",
        condutividade: 450,
        ph: 7.2,
        oxigenio: 6.8,
        temperatura: 26.5,
        timestamp: "2025-07-12 14:30:00"
      },
      {
        tanque_id: 2,
        nome: "Tanque Secundário",
        especie: "Pacu",
        capacidade: "150m³",
        condutividade: 580, 
        ph: 6.9,
        oxigenio: 5.5,
        temperatura: 27.1,
        timestamp: "2025-07-12 14:25:00"
      },
      {
        tanque_id: 3,
        nome: "Tanque Experimental",
        especie: "Tambaqui",
        capacidade: "100m³",
        condutividade: 1300, 
        ph: 7.5,
        oxigenio: 7.2,
        temperatura: 25.9,
        timestamp: "2025-07-12 14:20:00"
      }
    ];

    // Dados anuais simulados (para substituir get_estatistica_anual.php)
    let simulatedAnnualData = {
        1: { // Tanque 1 - Tanque Principal (Dados mais variados para histórico)
            condutividade: { 
                1: 420, 2: 435, 3: 450, 4: 480, 5: 510, 6: 530, // Condutividade subindo no meio do ano
                7: 500, 8: 470, 9: 455, 10: 440, 11: 425, 12: 410 
            },
            ph: { 
                1: 7.1, 2: 7.2, 3: 7.3, 4: 7.4, 5: 7.5, 6: 7.6, // PH com pico
                7: 7.4, 8: 7.3, 9: 7.2, 10: 7.1, 11: 7.0, 12: 6.9 
            },
            oxigenio: { 
                1: 7.0, 2: 6.8, 3: 6.5, 4: 6.0, 5: 5.5, 6: 5.0, // Oxigênio caindo no verão
                7: 4.8, 8: 5.2, 9: 5.8, 10: 6.3, 11: 6.7, 12: 6.9 
            },
            temperatura: { 
                1: 22.0, 2: 24.0, 3: 26.0, 4: 28.0, 5: 29.5, 6: 30.5, // Temperatura com pico no verão
                7: 30.0, 8: 28.5, 9: 26.5, 10: 24.5, 11: 23.0, 12: 21.5 
            }
        },
        2: { // Tanque 2 - Tanque Secundário (dados mantidos como você forneceu)
            condutividade: { 
                1: 520, 2: 540, 3: 560, 4: 580, 5: 600, 6: 620, 7: 610, 8: 590, 9: 570, 10: 550, 11: 530, 12: 510 
            },
            ph: { 
                1: 6.8, 2: 6.9, 3: 7.0, 4: 6.9, 5: 6.8, 6: 6.7, 7: 6.8, 8: 6.9, 9: 7.0, 10: 7.1, 11: 7.0, 12: 6.9 
            },
            oxigenio: { 
                1: 5.0, 2: 5.2, 3: 5.4, 4: 5.5, 5: 5.3, 6: 5.1, 7: 4.9, 8: 4.8, 9: 5.0, 10: 5.2, 11: 5.1, 12: 5.0 
            },
            temperatura: { 
                1: 26.0, 2: 26.5, 3: 27.0, 4: 27.5, 5: 28.0, 6: 28.5, 7: 29.0, 8: 28.8, 9: 28.0, 10: 27.0, 11: 26.5, 12: 26.0 
            }
        },
        3: { // Tanque 3 - Tanque Experimental (dados mantidos como você forneceu)
            condutividade: { 
                1: 1100, 2: 1250, 3: 1300, 4: 1150, 5: 1000, 6: 950, 7: 1050, 8: 1100, 9: 1200, 10: 1350, 11: 1200, 12: 1100 
            },
            ph: { 
                1: 7.4, 2: 7.5, 3: 7.6, 4: 7.5, 5: 7.4, 6: 7.3, 7: 7.4, 8: 7.5, 9: 7.6, 10: 7.7, 11: 7.6, 12: 7.5 
            },
            oxigenio: { 
                1: 7.0, 2: 7.1, 3: 7.2, 4: 7.0, 5: 6.8, 6: 6.5, 7: 6.3, 8: 6.5, 9: 6.8, 10: 7.0, 11: 7.1, 12: 7.0 
            },
            temperatura: { 
                1: 24.0, 2: 24.5, 3: 25.0, 4: 25.5, 5: 26.0, 6: 26.5, 7: 27.0, 8: 26.8, 9: 26.0, 10: 25.0, 11: 24.5, 12: 24.0 
            }
        }
    };
    // --- FIM DOS DADOS SIMULADOS ---


    // --- Função para Gerenciar o Tema (Modo Claro/Escuro) ---
    function applyTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            body.classList.toggle('dark-mode', savedTheme === 'dark');
            themeToggleButton.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i> ' : '<i class="fas fa-moon"></i> ';
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            body.classList.add('dark-mode');
            themeToggleButton.innerHTML = '<i class="fas fa-sun"></i> ';
            localStorage.setItem('theme', 'dark'); 
        } else {
            themeToggleButton.innerHTML = '<i class="fas fa-moon"></i> ';
            localStorage.setItem('theme', 'light'); 
        }
        updateChartColors(); 
    }

    function updateChartColors() {
        if (!currentChart) return;

        const isDarkMode = body.classList.contains('dark-mode');
        const borderColor = isDarkMode ? '#66ccff' : '#0077cc';
        const backgroundColor = isDarkMode ? 'rgba(102, 204, 255, 0.1)' : 'rgba(0,119,204,0.1)';
        const textColor = isDarkMode ? '#e0e0e0' : '#333';

        currentChart.data.datasets[0].borderColor = borderColor;
        currentChart.data.datasets[0].backgroundColor = backgroundColor;

        currentChart.options.scales.x.ticks.color = textColor;
        currentChart.options.scales.y.ticks.color = textColor;
        currentChart.options.scales.x.grid.color = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        currentChart.options.scales.y.grid.color = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

        currentChart.options.plugins.legend.labels.color = textColor;
        currentChart.options.plugins.title.color = textColor;

        currentChart.update();
    }
    // --- Fim da Função para Gerenciar o Tema ---

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
        updateChartColors();
    });

    // --- Função para carregar e popular o select de tanques (AGORA COM DADOS SIMULADOS) ---
    const loadTanks = async () => {
        tanqueSelect.innerHTML = '<option value="">Carregando tanques...</option>';
        try {
            // Usa os dados simulados diretamente
            const tanks = simulatedTankData; 

            tanqueSelect.innerHTML = '';
            if (tanks.length > 0) {
                const defaultOption = document.createElement('option');
                defaultOption.value = "";
                defaultOption.textContent = "Selecione um tanque...";
                tanqueSelect.appendChild(defaultOption);

                tanks.forEach(tank => {
                    const option = document.createElement('option');
                    option.value = tank.tanque_id;
                    option.textContent = `Tanque ${tank.tanque_id} - ${tank.nome}`;
                    tanqueSelect.appendChild(option);
                });

                const urlParams = new URLSearchParams(window.location.search);
                const tanqueIdFromURL = urlParams.get('tanque_id');
                if (tanqueIdFromURL && tanks.some(t => t.tanque_id == tanqueIdFromURL)) {
                    tanqueSelect.value = tanqueIdFromURL;
                } else {
                    if (tanks.length === 1) {
                            tanqueSelect.value = tanks[0].tanque_id;
                    } else {
                        tanqueSelect.value = ""; 
                    }
                }

                carregarHistorico();
            } else {
                tanqueSelect.innerHTML = '<option value="">Nenhum tanque encontrado</option>';
                sugestaoManejoDiv.innerHTML = '<p class="no-data-message">Nenhum tanque registrado no sistema.</p>';
                btnExportPdf.disabled = true; 
            }

        } catch (error) {
            console.error('Erro ao carregar tanques:', error);
            tanqueSelect.innerHTML = '<option value="">Erro ao carregar tanques</option>';
            sugestaoManejoDiv.innerHTML = '<p class="error-message">Erro ao carregar a lista de tanques. Tente recarregar a página.</p>';
            btnExportPdf.disabled = true; 
        }
    };

    // --- Função para carregar dados do histórico (AGORA COM DADOS SIMULADOS) ---
    const carregarHistorico = () => {
        const tanque = parseInt(tanqueSelect.value); // Converte para número
        const parametro = parametroSelect.value;

        if (!tanque || !parametro) {
            sugestaoManejoDiv.innerHTML = '<p>Selecione um tanque e um parâmetro para visualizar o histórico anual e obter sugestões de manejo.</p>';
            if (currentChart) {
                currentChart.destroy();
                currentChart = null;
            }
            graficoCanvas.style.display = 'none';
            btnExportPdf.disabled = true; 
            currentDataForPdf = []; 
            return;
        }

        graficoCanvas.style.display = 'none';
        sugestaoManejoDiv.innerHTML = '<p class="loading-message">Carregando dados...</p>';
        sugestaoManejoDiv.classList.add('sugestao');
        btnExportPdf.disabled = true; 

        // Simula a busca de dados do histórico anual
        new Promise(resolve => {
            setTimeout(() => {
                const data = simulatedAnnualData[tanque] ? simulatedAnnualData[tanque][parametro] : {};
                resolve(data);
            }, 500); 
        })
            .then(data => {
                const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                const valores = [];

                if (!data) {
                    throw new Error(`Dados não encontrados para Tanque ${tanque} - ${parametro}`);
                }

                currentDataForPdf = []; 
                currentParametroName = parametro.charAt(0).toUpperCase() + parametro.slice(1);

                for (let i = 1; i <= 12; i++) {
                    const valor = data[i] !== undefined ? Number(data[i]) : null; 
                    valores.push(valor);
                    
                    currentDataForPdf.push({
                        mes: meses[i - 1],
                        valor: valor !== null ? valor.toFixed(2) : 'N/A'
                    });
                }

                graficoCanvas.style.display = 'block';
                gerarGrafico(meses, valores, parametro);
                gerarSugestao(valores, parametro);
                btnExportPdf.disabled = false; 
            })
            .catch(err => {
                console.error('Erro ao carregar dados:', err);
                graficoCanvas.style.display = 'none';
                sugestaoManejoDiv.innerHTML = '<p class="error-message">Erro ao carregar histórico. Verifique a seleção e tente novamente.</p>';
                btnExportPdf.disabled = true; 
                currentDataForPdf = []; 
            });
    };

    btnCarregar.addEventListener('click', carregarHistorico);
    tanqueSelect.addEventListener('change', carregarHistorico);
    parametroSelect.addEventListener('change', carregarHistorico);


    function gerarGrafico(meses, valores, parametro) {
        if (currentChart) {
            currentChart.destroy();
        }

        const ctx = graficoCanvas.getContext('2d');

        const isDarkMode = body.classList.contains('dark-mode');
        const borderColor = isDarkMode ? '#66ccff' : '#0077cc';
        const backgroundColor = isDarkMode ? 'rgba(102, 204, 255, 0.1)' : 'rgba(0,119,204,0.1)';
        const textColor = isDarkMode ? '#e0e0e0' : '#333';

        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: meses,
                datasets: [{
                    label: `Média Mensal de ${parametro.charAt(0).toUpperCase() + parametro.slice(1)}`,
                    data: valores,
                    borderColor: borderColor,
                    backgroundColor: backgroundColor,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: borderColor,
                    pointBorderColor: 'white',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: textColor
                        }
                    },
                    title: {
                        display: true,
                        text: `Histórico Anual de ${parametro.charAt(0).toUpperCase() + parametro.slice(1)}`,
                        color: textColor,
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: isDarkMode ? 'rgba(44,44,44,0.9)' : 'rgba(0,0,0,0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: isDarkMode ? '#66ccff' : '#0077cc',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y.toFixed(2);
                                    if (parametro === 'condutividade') label += ' µS/cm';
                                    else if (parametro === 'oxigenio') label += ' mg/L';
                                    else if (parametro === 'temperatura') label += ' °C';
                                    else if (parametro === 'ph') label += ''; // PH não tem unidade comum
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        }
                    },
                    y: {
                        beginAtZero: false,
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
        updateChartColors();
    }
    // Função auxiliar para obter o status (copiado de das_script.js para self-containment)
    function getStatus(param, value) {
        if (value === null || value === undefined || isNaN(value)) {
            return "unknown"; 
        }

        if (param === "condutividade") {
            const LIMITE_NORMAL_MAX = 500;
            const LIMITE_CRITICO = 1200; 

            if (value >= LIMITE_CRITICO) {
                return "red"; 
            } else if (value > LIMITE_NORMAL_MAX && value < LIMITE_CRITICO) { // Inclui o "alerta preditivo" dentro do amarelo
                return "yellow"; 
            } else if (value <= LIMITE_NORMAL_MAX) {
                return "green"; 
            }
            return "unknown"; 
        } else if (param === "ph") {
            if (value >= 6.5 && value <= 8.0) {
                return "green";
            } else if ((value >= 6.0 && value < 6.5) || (value > 8.0 && value <= 8.5)) {
                return "yellow";
            } else {
                return "red";
            }
        } else if (param === "oxigenio") {
            if (value >= 5.0) {
                return "green";
            } else if (value >= 3.0 && value < 5.0) {
                return "yellow";
            } else {
                return "red";
            }
        } else if (param === "temperatura") {
            if (value >= 24.0 && value <= 30.0) {
                return "green";
            } else if ((value >= 22.0 && value < 24.0) || (value > 30.0 && value <= 32.0)) {
                return "yellow";
            } else {
                return "red";
            }
        }
        return "unknown";
    }

    function gerarSugestao(valores, parametro) {
        const valoresValidos = valores.filter(v => v !== null);
        if (valoresValidos.length === 0) {
            sugestaoManejoDiv.innerHTML = '<p>Não há dados suficientes para gerar sugestões para este parâmetro.</p>';
            return;
        }

        const mediaAnual = valoresValidos.reduce((a, b) => a + b, 0) / valoresValidos.length;
        let sugestaoHtml = '';
        const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

        sugestaoHtml += `<h3>Média Anual de ${parametro.charAt(0).toUpperCase() + parametro.slice(1)}: ${mediaAnual.toFixed(2)}</h3>`;
        sugestaoHtml += `<h4>Variações Mensais:</h4><ul>`;

        let temAlertas = false;

        valores.forEach((valor, i) => {
            if (valor !== null) {
                const status = getStatus(parametro, valor); 
                let iconHtml = '';
                let color = '';
                let statusText = '';

                if (status === "yellow") {
                    iconHtml = '<span style="font-weight: bold; color: #ffcc00;">&#9888;</span>'; // Atenção
                    color = '#ffcc00';
                    statusText = 'ATENÇÃO';
                    temAlertas = true;
                } else if (status === "red") {
                    iconHtml = '<span style="font-weight: bold; color: #e74c3c;">&#10006;</span>'; // Crítico
                    color = '#e74c3c';
                    statusText = 'CRÍTICO';
                    temAlertas = true;
                }

                if (status === "yellow" || status === "red") {
                    sugestaoHtml += `
                        <li>
                            ${iconHtml} Em <strong>${mesesNomes[i]}</strong>, o valor de <strong>${parametro.charAt(0).toUpperCase() + parametro.slice(1)}</strong> (${valor.toFixed(2)})
                            está em nível de <span style="font-weight: bold; color: ${color};">${statusText}</span>.
                        </li>
                    `;
                }
            }
        });

        if (temAlertas) {
            sugestaoHtml += '</ul><p><strong>Recomendações:</strong> Monitore as condições ambientais durante esses períodos e ajuste as práticas de manejo, como alimentação e qualidade da água, para mitigar os impactos. Consulte um especialista para análises mais aprofundadas.</p>';
        } else {
            sugestaoHtml = `<h3>Média Anual de ${parametro.charAt(0).toUpperCase() + parametro.slice(1)}: ${mediaAnual.toFixed(2)}</h3>`;
            sugestaoHtml += '<p>Nenhuma variação significativa detectada. Os parâmetros estão estáveis e dentro da média anual, indicando boas condições de manejo.</p>';
        }

        sugestaoManejoDiv.innerHTML = sugestaoHtml;
        sugestaoManejoDiv.classList.add('sugestao');
    }

    // --- NOVO: Função para exportar para PDF ---
    btnExportPdf.addEventListener('click', async () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4'); 

        const tanqueNomeTexto = tanqueSelect.options[tanqueSelect.selectedIndex].textContent;
        const parametroNomeTexto = parametroSelect.options[parametroSelect.selectedIndex].textContent;

        doc.setFontSize(18);
        doc.text(`Relatório Anual - ${parametroNomeTexto}`, 14, 20);
        doc.setFontSize(12);
        doc.text(`Tanque: ${tanqueNomeTexto}`, 14, 28);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 34);

        let chartBottomY = 45; 
        if (currentChart) {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = graficoCanvas.width;
            tempCanvas.height = graficoCanvas.height;
            tempCtx.fillStyle = 'white';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(graficoCanvas, 0, 0);

            const imgData = tempCanvas.toDataURL('image/png', 1.0); 
            const imgWidth = 180; 
            const imgHeight = (tempCanvas.height * imgWidth) / tempCanvas.width; 
            doc.addImage(imgData, 'PNG', 14, chartBottomY, imgWidth, imgHeight); 

            doc.setFontSize(10);
            doc.text('Gráfico de Média Mensal', 14, chartBottomY + imgHeight + 5); 
            chartBottomY += imgHeight + 15; 
        } else {
            doc.setFontSize(12);
            doc.text('Gráfico não disponível para exportação.', 14, chartBottomY);
            chartBottomY += 15; 
        }

        doc.setFontSize(14);
        doc.text('Dados Detalhados:', 14, chartBottomY + 10); 

        const tableColumn = ["Mês", parametroNomeTexto];
        const tableRows = [];

        currentDataForPdf.forEach(item => {
            tableRows.push([item.mes, item.valor]);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: chartBottomY + 15, 
            theme: 'striped', 
            headStyles: { fillColor: [41, 128, 185] }, 
            styles: {
                fontSize: 10,
                cellPadding: 2,
                halign: 'center' 
            }
        });

        const sugestaoHtmlContent = sugestaoManejoDiv.innerHTML;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sugestaoHtmlContent;

        const sugestaoTitle = tempDiv.querySelector('h3') ? tempDiv.querySelector('h3').innerText : '';
        const sugestaoSubtitle = tempDiv.querySelector('h4') ? tempDiv.querySelector('h4').innerText : '';

        const sugestaoListItems = Array.from(tempDiv.querySelectorAll('li')).map(li => `- ${li.innerText}`);
        let sugestaoPara = tempDiv.querySelector('p:last-of-type') ? tempDiv.querySelector('p:last-of-type').innerText : '';

        let finalY = doc.lastAutoTable.finalY + 10;
        if (finalY > 260) { 
            doc.addPage();
            finalY = 20; 
        }

        doc.setFontSize(14);
        doc.text('Sugestões de Manejo:', 14, finalY);
        finalY += 8;

        doc.setFontSize(10);
        if (sugestaoTitle) {
            doc.text(sugestaoTitle, 14, finalY);
            finalY += 6;
        }
        if (sugestaoSubtitle) {
            doc.text(sugestaoSubtitle, 14, finalY);
            finalY += 6;
        }

        sugestaoListItems.forEach(item => {
            const splitText = doc.splitTextToSize(item, doc.internal.pageSize.width - 28); 
            doc.text(splitText, 14, finalY);
            finalY += (splitText.length * doc.getLineHeight()) / doc.internal.scaleFactor; 
            finalY += 2; 
        });
        if (sugestaoListItems.length > 0) {
            finalY += 5; 
        }

        if (sugestaoPara) {
            const splitPara = doc.splitTextToSize(sugestaoPara, doc.internal.pageSize.width - 28);
            doc.text(splitPara, 14, finalY);
            finalY += (splitPara.length * doc.getLineHeight()) / doc.internal.scaleFactor;
        }

        const filename = `Historico_Anual_${tanqueSelect.value}_${parametroSelect.value}.pdf`;
        doc.save(filename);
    });
    // --- FIM NOVO: Função para exportar para PDF ---


    // Carrega a lista de tanques ao carregar a página
    loadTanks();
});