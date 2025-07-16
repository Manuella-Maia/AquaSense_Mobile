const btnRefresh = document.getElementById("btnRefresh");
const btnToggleDark = document.getElementById("btnToggleDark");
const filterTanque = document.getElementById("filterTanque");
const filterParametro = document.getElementById("filterParametro");
const tankList = document.getElementById("tankList");
const mainLogo = document.getElementById('mainLogo');

// NOVO: Referência ao botão de voz
const btnToggleVoice = document.getElementById("btnToggleVoice");

let allTanques = [];
let darkMode = false; // Variável para controlar o estado do tema

// NOVO: Variável para controlar o estado da voz
let voiceEnabled = localStorage.getItem('voiceEnabled') === 'true'; // Carrega do localStorage, padrão para true se não existir

// Ícones FontAwesome por parâmetro
const paramIcons = {
    condutividade: '<i class="fas fa-water param-icon" title="Condutividade"></i>',
    ph: '<i class="fas fa-vial param-icon" title="pH"></i>',
    oxigenio: '<i class="fas fa-tint param-icon" title="Oxigênio Dissolvido"></i>',
    temperatura: '<i class="fas fa-thermometer-half param-icon" title="Temperatura"></i>',
};

// --- DADOS SIMULADOS PARA SUBSTITUIR O BACKEND PHP ---
// Estes dados simulam o que viria do 'das_get_dados.php'
// Apenas 3 tanques conforme solicitado
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
        condutividade: 580, // Atenção
        ph: 6.9,
        oxigenio: 3.5,
        temperatura: 27.1,
        timestamp: "2025-07-12 14:25:00"
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
        timestamp: "2025-07-12 14:20:00"
    }
];

// --- FUNÇÃO getStatus ATUALIZADA PARA CONDUTIVIDADE ---
function getStatus(param, value) {
    if (value === null || value === undefined || isNaN(value)) {
        return "yellow"; // Se sem dados, considera atenção (amarelo)
    }

    if (param === "condutividade") {
        const LIMITE_NORMAL_MAX = 500;
        const LIMITE_CRITICO = 1200;

        if (value >= LIMITE_CRITICO) {
            return "red"; // Vermelho - Crítico (>= 1200)
        }
        if (value > LIMITE_NORMAL_MAX && value < LIMITE_CRITICO) {
            return "yellow"; // Amarelo - Atenção/Preditivo (501 a 1199)
        }
        if (value <= LIMITE_NORMAL_MAX) {
            return "green"; // Verde - Normal (<= 500)
        }
        return "yellow";
    }

    if (param === "ph") {
        if (value >= 6.5 && value <= 8) return "green";
        return "yellow";
    }
    if (param === "oxigenio") {
        if (value >= 5) return "green";
        if (value >= 3.5) return "yellow";
        return "red";
    }
    if (param === "temperatura") {
        if (value >= 24 && value <= 28) return "green";
        if (value < 22 || value > 30) return "red";
        return "yellow";
    }

    return "yellow";
}
// --- FIM DA FUNÇÃO getStatus ATUALIZADA ---

function createParameterMini(param, value, tanque_id) {
    if (filterParametro.value !== "all" && filterParametro.value !== param) {
        return "";
    }

    const icon = paramIcons[param] || "";
    const statusClass = getStatus(param, value);
    const valueDisplay = value !== null && value !== undefined ? value.toFixed(2) : "-";

    let unit = "";
    if (param === "condutividade") unit = "µS/cm";
    else if (param === "oxigenio") unit = "mg/L";
    else if (param === "temperatura") unit = "°C";

    return `
        <a href="condutividade.html?tanque_id=${tanque_id}" class="parameter-mini" title="Detalhes ${param.charAt(0).toUpperCase() + param.slice(1)} Tanque ${tanque_id}">
            ${icon}
            <h4>${param.charAt(0).toUpperCase() + param.slice(1)}</h4>
            <span class="value"><span class="number">${valueDisplay}</span><span class="unit"> ${unit}</span></span>
            <div class="status-indicator ${statusClass}"></div>
        </a>
    `;
}

function renderTanques(tanques) {
    tankList.innerHTML = "";

    if (!tanques || tanques.length === 0) {
        tankList.innerHTML = "<p>Nenhum dado encontrado.</p>";
        return;
    }

    let filteredTanques = tanques;
    if (filterTanque.value !== "all") {
        filteredTanques = tanques.filter((t) => t.tanque_id == filterTanque.value);
    }

    filteredTanques.forEach((tanque) => {
        const leitura = new Date(tanque.timestamp);
        const leituraFormatada = leitura.toLocaleString("pt-BR");

        let parametrosHtml = "";
        parametrosHtml += createParameterMini("condutividade", tanque.condutividade, tanque.tanque_id);
        parametrosHtml += createParameterMini("ph", tanque.ph, tanque.tanque_id);
        parametrosHtml += createParameterMini("oxigenio", tanque.oxigenio, tanque.tanque_id);
        parametrosHtml += createParameterMini("temperatura", tanque.temperatura, tanque.tanque_id);

        if (filterParametro.value !== "all" && parametrosHtml.trim() === "") {
            return;
        }

        const card = document.createElement("div");
        card.className = "tank-card";

        card.innerHTML = `
            <h3>Tanque ${tanque.tanque_id}</h3>
            <p>Última leitura: ${leituraFormatada}</p>
            <div class="parameter-dashboard">
                ${parametrosHtml}
            </div>
            <div class="card-actions">
                <button class="btn-historico" onclick="window.location.href='historico_anual.html?tanque_id=${tanque.tanque_id}'">
                    <i class="fas fa-chart-line"></i> Ver Histórico Anual
                </button>
            </div>
        `;

        tankList.appendChild(card);
    });
}

function preencherFiltroTanque(tanques) {
    const uniqueIds = Array.from(new Set(tanques.map((t) => t.tanque_id)));
    filterTanque.innerHTML = `<option value="all">Todos os Tanques</option>`;
    uniqueIds.forEach((id) => {
        filterTanque.innerHTML += `<option value="${id}">Tanque ${id}</option>`;
    });
}

function carregarDados() {
    btnRefresh.disabled = true;
    btnRefresh.classList.add("loading");

    // Os dados simulados agora permanecerão fixos e não serão alterados aleatoriamente
    // simulatedTankData = simulatedTankData.map(tank => {
    //     return {
    //         ...tank,
    //         // Ajusta valores de forma aleatória para simular dados em tempo real
    //         condutividade: parseFloat((tank.condutividade + (Math.random() * 20 - 10)).toFixed(2)),
    //         ph: parseFloat((tank.ph + (Math.random() * 0.2 - 0.1)).toFixed(2)),
    //         oxigenio: parseFloat((tank.oxigenio + (Math.random() * 0.5 - 0.25)).toFixed(2)),
    //         temperatura: parseFloat((tank.temperatura + (Math.random() * 0.8 - 0.4)).toFixed(2)),
    //         // MUDANÇA AQUI: Usar toISOString() para garantir um formato de data válido
    //         timestamp: new Date().toISOString()
    //     };
    // });

    // Simula um pequeno atraso para a requisição de rede
    setTimeout(() => {
        allTanques = simulatedTankData; // Usa os dados simulados (fixos)
        preencherFiltroTanque(allTanques);
        renderTanques(allTanques);

        btnRefresh.disabled = false;
        btnRefresh.classList.remove("loading");
    }, 500); // Simula 0.5 segundo de atraso
}

// Event Listeners
btnRefresh.addEventListener("click", carregarDados);
filterTanque.addEventListener("change", () => renderTanques(allTanques));
filterParametro.addEventListener("change", () => renderTanques(allTanques));

// --- Lógica do Botão de Tema ATUALIZADA ---
function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        darkMode = savedTheme === 'dark';
        btnToggleDark.innerHTML = darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        if (mainLogo) {
            mainLogo.src = darkMode ? 'logo_preta.png' : 'logo_teste3.png';
        }
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
        darkMode = true;
        btnToggleDark.innerHTML = '<i class="fas fa-sun"></i> ';
        localStorage.setItem('theme', 'dark');
        if (mainLogo) {
            mainLogo.src = 'logo_preta.png';
        }
    } else {
        darkMode = false;
        btnToggleDark.innerHTML = '<i class="fas fa-moon"></i> ';
        localStorage.setItem('theme', 'light');
        if (mainLogo) {
            mainLogo.src = 'logo_teste3.png';
        }
    }
}

// NOVO: Função para aplicar o estado do botão de voz
function applyVoiceButtonState() {
    if (voiceEnabled) {
        btnToggleVoice.innerHTML = '<i class="fas fa-volume-up"></i> Voz: ON';
        btnToggleVoice.classList.remove('voice-disabled');
    } else {
        btnToggleVoice.innerHTML = '<i class="fas fa-volume-mute"></i> Voz: OFF';
        btnToggleVoice.classList.add('voice-disabled');
    }
}

// Carrega os dados e aplica o tema quando o DOM estiver completamente carregado
document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    applyVoiceButtonState(); // Aplica o estado inicial do botão de voz
    carregarDados(); // Carrega os dados iniciais
});

btnToggleDark.addEventListener("click", () => {
    darkMode = !darkMode;
    document.body.classList.toggle("dark-mode", darkMode);

    if (darkMode) {
        btnToggleDark.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
        if (mainLogo) {
            mainLogo.src = 'logo_preta.png';
        }
    } else {
        btnToggleDark.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
        if (mainLogo) {
            mainLogo.src = 'logo_teste3.png';
        }
    }
});

// NOVO: Event Listener para o botão de voz
btnToggleVoice.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled; // Inverte o estado
    localStorage.setItem('voiceEnabled', voiceEnabled); // Salva no localStorage
    applyVoiceButtonState(); // Atualiza o botão
});

// Atualiza os dados a cada 5 minutos (300000 milissegundos)
setInterval(carregarDados, 300000);