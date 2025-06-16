const toggleBtn = document.getElementById('toggleLogin');
const clienteCard = document.querySelector('.cliente-card');
const motoristaCard = document.querySelector('.motorista-card');

toggleBtn.addEventListener('click', () => {
    const clienteVisible = !clienteCard.classList.contains('d-none');
    if (clienteVisible) {
        clienteCard.classList.add('d-none');
        motoristaCard.classList.remove('d-none');
        toggleBtn.textContent = 'Alternar para Cliente';

        const selectMotorista = document.getElementById('motoristaId');
        const btnEntrarMotorista = document.getElementById('btnEntrarMotorista');
        const formMotorista = document.getElementById('formMotorista');

        // Habilita/desabilita botão conforme seleção
        selectMotorista.addEventListener('change', () => {
            btnEntrarMotorista.disabled = selectMotorista.value === '';
        });

        // Captura submit, valida e redireciona
        formMotorista.addEventListener('submit', (e) => {
            e.preventDefault();
            const motoristaId = selectMotorista.value;
            if (!motoristaId) {
                alert('Por favor, selecione um motorista.');
                return;
            }
            // Redireciona para a página do motorista, passando o ID na query string
            window.location.href = `motorista.html?id=${motoristaId}`;
        });
    } else {
        clienteCard.classList.remove('d-none');
        motoristaCard.classList.add('d-none');
        toggleBtn.textContent = 'Alternar para Motorista';
    }
});

