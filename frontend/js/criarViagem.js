document.getElementById('motoristaId').addEventListener('input', function (e) {
    this.value = this.value.replace(/[.,]/g, ''); // Remove vírgula e ponto
});

document.addEventListener('DOMContentLoaded', () => {
    const placaInput = document.getElementById('placaCaminhao');

    placaInput.addEventListener('input', (e) => {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (value.length > 7) value = value.slice(0, 7);

        e.target.value = value;
    });

});

function isPlacaValida(placa) {
    return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placa);
}

const cepOrigemInput = document.getElementById('cepDestino');
cepOrigemInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, ''); // remove tudo que não for número

  if (value.length > 5) {
    value = value.slice(0, 5) + '-' + value.slice(5, 8);
  }

  e.target.value = value.slice(0, 9); // limita tamanho máximo
});

const cepDestinoInput = document.getElementById('cepOrigem');
cepDestinoInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, ''); // remove tudo que não for número

  if (value.length > 5) {
    value = value.slice(0, 5) + '-' + value.slice(5, 8);
  }

  e.target.value = value.slice(0, 9); // limita tamanho máximo
});

document.getElementById('createTripBtn').addEventListener('click', async () => {
    const modalElement = document.getElementById('criarViagemResultadoModal');
    const modal = new bootstrap.Modal(modalElement);
    const modalContent = document.getElementById('modalContentCriarViagem');

    modalContent.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Enviando dados, por favor aguarde...</p>
        </div>
    `;
    modal.show();

    // Pega os campos básicos
    const descricaoCarga = document.getElementById('descricaoCarga').value.trim();
    const placaCaminhao = document.getElementById('placaCaminhao').value.trim().toUpperCase();
    const pesoCarga = document.getElementById('pesoCarga').value.trim();
    const motoristaId = document.getElementById('motoristaId').value.trim();

    // Pega dados origem
    const cepOrigem = document.getElementById('cepOrigem').value.trim();
    const numeroOrigem = document.getElementById('numeroOrigem').value.trim();
    let origem_lat = document.getElementById('origemLat').value;
    let origem_lng = document.getElementById('origemLng').value;

    // Pega dados destino
    const cepDestino = document.getElementById('cepDestino').value.trim();
    const numeroDestino = document.getElementById('numeroDestino').value.trim();
    let destino_lat = document.getElementById('destinoLat').value;
    let destino_lng = document.getElementById('destinoLng').value;

    const erros = [];

    // Validações básicas (você já tem, inclua aqui também cep e número)
    if (!descricaoCarga || descricaoCarga.length < 3) {
        erros.push("A descrição da carga deve ter pelo menos 3 caracteres.");
    }
    const regexPlaca = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
    if (!regexPlaca.test(placaCaminhao)) {
        erros.push("Placa do caminhão inválida. Exemplo válido: ABC1D23");
    }
    const peso = parseFloat(pesoCarga.replace(',', '.'));
    if (isNaN(peso) || peso <= 0) {
        erros.push("Peso da carga deve ser um número positivo.");
    }
    const motorista = parseInt(motoristaId);
    if (isNaN(motorista) || motorista <= 0) {
        erros.push("ID do motorista deve ser um número inteiro positivo.");
    }
    if (!cepOrigem) erros.push("CEP de origem é obrigatório.");
    if (!numeroOrigem) erros.push("Número de origem é obrigatório.");
    if (!cepDestino) erros.push("CEP de destino é obrigatório.");
    if (!numeroDestino) erros.push("Número de destino é obrigatório.");

    if (erros.length > 0) {
        modalContent.innerHTML = erros.map(e => `<p class="text-danger">${e}</p>`).join('');
        modal.show();
        return;
    }

    // Se lat/lng origem não existir, busca
    try {
        if (!origem_lat || !origem_lng) {
            const resultadoOrigem = await buscarEnderecoPorCepNumero(cepOrigem, numeroOrigem);
            origem_lat = resultadoOrigem.lat;
            origem_lng = resultadoOrigem.lng;
        }
        if (!destino_lat || !destino_lng) {
            const resultadoDestino = await buscarEnderecoPorCepNumero(cepDestino, numeroDestino);
            destino_lat = resultadoDestino.lat;
            destino_lng = resultadoDestino.lng;
        }
    } catch (e) {
        modalContent.innerHTML = `<p class="text-danger">Erro ao buscar localização: ${e.message}</p>`;
        modal.show();
        return;
    }

    // Envia para API com lat/lng incluídos
    try {
        const response = await fetch(`${apiUrl}/criarViagem`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                descricao_carga: descricaoCarga,
                placa_caminhao: placaCaminhao,
                peso_carga: peso,
                motoristaId: motorista,
                origem_lat: origem_lat,
                origem_lng: origem_lng,
                destino_lat: destino_lat,
                destino_lng: destino_lng
            })
        });

        const resultado = await response.json();

        if (response.ok) {
            modalContent.innerHTML = `<p class="text-success">Viagem criada com sucesso!</p>`;
            modalContent.innerHTML += `<p>Código de rastreamento: ${resultado.codigo_rastreamento}</p>`;
        } else {
            modalContent.innerHTML = `<p class="text-danger">${resultado.erro || 'Erro ao criar viagem.'}</p>`;
        }
    } catch (err) {
        modalContent.innerHTML = `<p class="text-danger">Erro inesperado ao enviar os dados.</p>`;
    }

    modal.show();
});

async function buscarEnderecoPorCepNumero(cep, numero) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) throw new Error('CEP inválido');

    // Buscar dados no ViaCEP
    const respostaCep = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    if (!respostaCep.ok) throw new Error('Erro ao buscar CEP');
    const dadosCep = await respostaCep.json();

    if (dadosCep.erro) throw new Error('CEP não encontrado');

    const enderecoCompleto = `${dadosCep.logradouro}, ${numero}, ${dadosCep.localidade} - ${dadosCep.uf}`;

    // Buscar lat/lng via Nominatim (OpenStreetMap)
    let query = encodeURIComponent(enderecoCompleto);
    let geoResp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
    if (!geoResp.ok) throw new Error('Erro ao buscar coordenadas');

    let geoData = await geoResp.json();
    
    if (geoData.length === 0) {
        const somenteRua = `${dadosCep.logradouro}`;
        query = encodeURIComponent(somenteRua);
        geoResp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
        geoData = await geoResp.json();
    }

    if (geoData.length === 0) throw new Error('Coordenadas não encontradas');

    const { lat, lon } = geoData[0];

    return {
        endereco: enderecoCompleto,
        lat: parseFloat(lat),
        lng: parseFloat(lon)
    };
}

async function buscarEndereco(tipo) {
    const cep = document.getElementById(`cep${capitalize(tipo)}`).value.replace(/\D/g, '');
    const numero = document.getElementById(`numero${capitalize(tipo)}`).value.trim();
    const output = document.getElementById(`endereco${capitalize(tipo)}`);

    if (!cep || !numero) {
        output.innerText = "Preencha o CEP e número corretamente.";
        document.getElementById(`${tipo}Lat`).value = "";
        document.getElementById(`${tipo}Lng`).value = "";
        return;
    }

    try {
        const viaCepResp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const viaCepData = await viaCepResp.json();

        if (viaCepData.erro) {
            output.innerText = "CEP inválido.";
            return;
        }

        const enderecoCompleto = `${viaCepData.logradouro}, ${numero}, ${viaCepData.localidade} - ${viaCepData.uf}`;
        output.innerText = `Endereço: ${enderecoCompleto}`;

        // Agora converte para latitude e longitude (usando Nominatim - OpenStreetMap)
        // Primeira tentativa: endereço completo com número
        let query = encodeURIComponent(enderecoCompleto);
        let geoResp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
        let geoData = await geoResp.json();

        if (geoData.length === 0) {
            const somenteRua = `${viaCepData.logradouro}`;
            query = encodeURIComponent(somenteRua);
            geoResp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
            geoData = await geoResp.json();
        }

        if (geoData.length === 0) {
            document.getElementById(`${tipo}Lat`).value = "";
            document.getElementById(`${tipo}Lng`).value = "";
            output.innerText += "\n(Coordenadas não encontradas)";
            return;
        }

        const { lat, lon } = geoData[0];

        document.getElementById(`${tipo}Lat`).value = lat;
        document.getElementById(`${tipo}Lng`).value = lon;

    } catch (err) {
        output.innerText = "Erro ao buscar endereço.";
        document.getElementById(`${tipo}Lat`).value = "";
        document.getElementById(`${tipo}Lng`).value = "";
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
