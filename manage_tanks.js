document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('themeToggleButton');
    const tanksTableBody = document.querySelector('#tanksTable tbody');
    const addTankButton = document.getElementById('addTankButton');
    const tankModal = document.getElementById('tankModal');
    const confirmModal = document.getElementById('confirmModal');
    const closeButtons = document.querySelectorAll('.close-button');
    const modalTitle = document.getElementById('modalTitle');
    const tankForm = document.getElementById('tankForm');
    const tankIdInput = document.getElementById('tankId');
    const tankNameInput = document.getElementById('tankName');
    const tankSpeciesInput = document.getElementById('tankSpecies');
    const tankCapacityInput = document.getElementById('tankCapacity');
    const saveTankButton = document.getElementById('saveTankButton');
    const modalErrorMessage = document.getElementById('modalErrorMessage');
    const confirmTankName = document.getElementById('confirmTankName');
    const confirmInactivateButton = document.getElementById('confirmInactivateButton');
    const cancelInactivateButton = document.getElementById('cancelInactivateButton');
    const noTanksMessage = document.getElementById('noTanksMessage');

    let tankToInactivateId = null; // Variável para armazenar o ID do tanque a ser inativado

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

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        applyTheme(true);
    } else {
        applyTheme(false);
    }

    themeToggleButton.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        applyTheme(!isDarkMode);
        localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
    });

    // --- Dados Simulados (Substituindo o Backend PHP) ---
    let simulatedTanks = JSON.parse(localStorage.getItem('simulatedTanks')) || [
        { tanque_id: 1, nome: "Tanque Principal", especie: "Tilápia", capacidade: "200m³", is_active: 1 },
        { tanque_id: 2, nome: "Tanque Secundário", especie: "Pacu", capacidade: "150m³", is_active: 1 },
        { tanque_id: 3, nome: "Tanque Experimental", especie: "Tambaqui", capacidade: "100m³", is_active: 1 }
    ];

    const saveTanksToLocalStorage = () => {
        localStorage.setItem('simulatedTanks', JSON.stringify(simulatedTanks));
    };

    // Função para carregar e exibir os tanques
    const loadTanks = async () => {
        tanksTableBody.innerHTML = '<tr><td colspan="6" class="loading-message">Carregando tanques...</td></tr>';
        noTanksMessage.style.display = 'none';

        // Simula um pequeno atraso para UX (como se estivesse buscando do servidor)
        await new Promise(resolve => setTimeout(resolve, 300));

        tanksTableBody.innerHTML = ''; // Limpa a mensagem de carregamento

        if (simulatedTanks.length > 0) {
            simulatedTanks.forEach(tank => {
                const row = tanksTableBody.insertRow();
                const statusText = tank.is_active === 1 ? 'Ativo' : 'Inativo';
                const statusClass = tank.is_active === 1 ? 'active' : 'inactive';

                row.innerHTML = `
                    <td>${tank.tanque_id}</td>
                    <td>${tank.nome}</td>
                    <td>${tank.especie}</td>
                    <td>${tank.capacidade}</td>
                    <td><span class="tank-status ${statusClass}">${statusText}</span></td>
                    <td class="action-buttons">
                        <button class="button edit-button" data-id="${tank.tanque_id}" data-name="${tank.nome}" data-species="${tank.especie}" data-capacity="${tank.capacidade}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        ${tank.is_active === 1 ? // Só mostra o botão de Inativar se o tanque estiver ativo
                            `<button class="button inactivate-button" data-id="${tank.tanque_id}" data-name="${tank.nome}">
                                <i class="fas fa-ban"></i> Inativar
                            </button>` :
                            // Se inativo, não mostra nenhum botão de ativação/inativação
                            '' 
                        }
                    </td>
                `;
            });
        } else {
            noTanksMessage.style.display = 'block';
        }
    };

    // --- Lógica do Modal de Adicionar/Editar ---
    const openTankModal = (tank = null) => {
        closeConfirmModal(); // Garante que o modal de confirmação esteja fechado
        modalErrorMessage.textContent = ''; // Limpa mensagens de erro anteriores
        if (tank) {
            modalTitle.textContent = 'Editar Tanque';
            tankIdInput.value = tank.tanque_id;
            tankNameInput.value = tank.nome;
            tankSpeciesInput.value = tank.especie;
            tankCapacityInput.value = tank.capacidade;
        } else {
            modalTitle.textContent = 'Adicionar Novo Tanque';
            tankIdInput.value = ''; // Indica que é um novo tanque
            tankForm.reset(); // Limpa o formulário para um novo tanque
        }
        tankModal.style.display = 'flex'; // Mostra o modal
    };

    const closeTankModal = () => {
        tankModal.style.display = 'none';
    };

    addTankButton.addEventListener('click', () => openTankModal());

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeTankModal();
            closeConfirmModal();
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target == tankModal) {
            closeTankModal();
        }
        if (event.target == confirmModal) {
            closeConfirmModal();
        }
    });

    // --- Lógica de Salvar Tanque (Adicionar ou Editar) ---
    tankForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        modalErrorMessage.textContent = '';
        saveTankButton.disabled = true; // Desabilita o botão para evitar múltiplos envios

        const tankId = tankIdInput.value;
        const nome = tankNameInput.value.trim();
        const especie = tankSpeciesInput.value.trim();
        const capacidade = tankCapacityInput.value.trim();

        if (!nome || !especie || !capacidade) {
            modalErrorMessage.textContent = 'Por favor, preencha todos os campos.';
            saveTankButton.disabled = false;
            return;
        }

        // Simula um atraso de rede
        await new Promise(resolve => setTimeout(resolve, 500));

        if (tankId) {
            // Editar tanque existente
            const index = simulatedTanks.findIndex(t => t.tanque_id == tankId);
            if (index !== -1) {
                simulatedTanks[index].nome = nome;
                simulatedTanks[index].especie = especie;
                simulatedTanks[index].capacidade = capacidade;
                saveTanksToLocalStorage();
                alert('Tanque atualizado com sucesso!');
                closeTankModal();
                loadTanks();
            } else {
                modalErrorMessage.textContent = 'Tanque não encontrado para edição.';
            }
        } else {
            // Adicionar novo tanque
            const newId = simulatedTanks.length > 0 ? Math.max(...simulatedTanks.map(t => t.tanque_id)) + 1 : 1;
            const newTank = {
                tanque_id: newId,
                nome: nome,
                especie: especie,
                capacidade: capacidade,
                is_active: 1 // Novos tanques são ativos por padrão
            };
            simulatedTanks.push(newTank);
            saveTanksToLocalStorage();
            alert('Tanque adicionado com sucesso!');
            closeTankModal();
            loadTanks();
        }
        saveTankButton.disabled = false;
    });

    // --- Lógica de Editar Tanque (Delegation) ---
    tanksTableBody.addEventListener('click', (event) => {
        const editButton = event.target.closest('.edit-button');
        if (editButton) {
            const tank = {
                tanque_id: editButton.dataset.id,
                nome: editButton.dataset.name,
                especie: editButton.dataset.species,
                capacidade: editButton.dataset.capacity
            };
            openTankModal(tank);
        }
    });

    // --- Lógica de Inativar Tanque (Confirmação e Ação) ---
    const openConfirmModal = (id, name) => { // Removido o parâmetro 'action'
        closeTankModal(); // Garante que o modal de adicionar/editar esteja fechado
        tankToInactivateId = id;
        confirmTankName.textContent = name;

        // Configurações fixas para inativação
        confirmModal.querySelector('h2').textContent = 'Confirmar Inativação';
        confirmModal.querySelector('p').innerHTML = `Você tem certeza que deseja inativar o tanque "<strong>${name}</strong>"?`;
        confirmInactivateButton.textContent = 'Inativar';
        confirmInactivateButton.classList.remove('success-button'); // Garante que não tenha a classe de sucesso
        confirmInactivateButton.classList.add('danger-button');
        // confirmInactivateButton.dataset.action = 'inactivate'; // Não é mais necessário, pois a ação é sempre inativar

        confirmModal.style.display = 'flex';
    };

    const closeConfirmModal = () => {
        confirmModal.style.display = 'none';
        tankToInactivateId = null;
    };

    tanksTableBody.addEventListener('click', (event) => {
        const inactivateButton = event.target.closest('.inactivate-button');
        
        if (inactivateButton) {
            const id = inactivateButton.dataset.id;
            const name = inactivateButton.dataset.name;
            openConfirmModal(id, name); // Chamada sem o parâmetro 'action'
        }
    });

    confirmInactivateButton.addEventListener('click', async () => {
        if (!tankToInactivateId) return;

        confirmInactivateButton.disabled = true;
        cancelInactivateButton.disabled = true;

        // A ação é sempre 'inativar'
        // const action = confirmInactivateButton.dataset.action; // Não é mais necessário

        // Simula um atraso de rede
        await new Promise(resolve => setTimeout(resolve, 500));

        const index = simulatedTanks.findIndex(t => t.tanque_id == tankToInactivateId);
        if (index !== -1) {
            // Apenas inativa o tanque
            simulatedTanks[index].is_active = 0;
            alert('Tanque inativado com sucesso!');
            
            saveTanksToLocalStorage();
            closeConfirmModal();
            loadTanks();
        } else {
            alert('Erro: Tanque não encontrado.');
        }

        confirmInactivateButton.disabled = false;
        cancelInactivateButton.disabled = false;
    });

    cancelInactivateButton.addEventListener('click', closeConfirmModal);

    // Carregar tanques ao iniciar a página e garantir que os modais estejam fechados
    closeTankModal(); // Garante que o modal de adicionar/editar esteja fechado ao carregar
    closeConfirmModal(); // Garante que o modal de confirmação esteja fechado ao carregar
    loadTanks();
});