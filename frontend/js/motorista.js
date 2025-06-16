const apiUrl = 'http://localhost:3000';
let mapa;
let marcadorAtual;
let rotaAtual;

document.addEventListener('DOMContentLoaded', () => {
    const motoristas = {
        1: 'João Silva',
        2: 'Maria Souza',
        3: 'Carlos Oliveira',
        4: 'Fernanda Lima',
        5: 'Ricardo Alves'
    };

    const motoristaId = getMotoristaIdDaUrl();

    carregarViagens(motoristaId);

    const nome = motoristas[motoristaId];

    if (nome) {
        const span = document.createElement('span');
        span.textContent = nome;
        span.classList.add('motorista-nome');

        const logoutDiv = document.querySelector('.logout');
        logoutDiv.parentNode.insertBefore(span, logoutDiv);
    }

    document.querySelector('button[data-bs-target="#andamento"]').addEventListener('shown.bs.tab', function () {
    const motoristaId = getMotoristaIdDaUrl();

    carregarViagemEmAndamento(motoristaId);
});
});




async function carregarViagens(motoristaId) {
    const container = document.querySelector('#track .list-group');

    container.innerHTML = `
        <div class="list-group-item text-center" id="viagem-loading">
            Carregando...
        </div>
    `;

    try {
        const response = await fetch(`${apiUrl}/viagem/listarViagens?motorista=${motoristaId}`);
        const viagens = await response.json();

        // Se não encontrar viagens, mostra mensagem
        if (viagens.length === 0) {
            container.innerHTML = `
                <div class="list-group-item text-center">
                    Nenhuma viagem encontrada.
                </div>
            `;
            return;
        }

        // Carrega todos os endereços antes de preencher a lista
        const viagensComEnderecos = await Promise.all(viagens.map(async viagem => {
            const [enderecoOrigem, enderecoDestino] = await Promise.all([
                getEndereco(viagem.origem_lat, viagem.origem_lng),
                getEndereco(viagem.destino_lat, viagem.destino_lng)
            ]);
            return { ...viagem, enderecoOrigem, enderecoDestino };
        }));

        // Limpa o container e exibe todas as viagens
        container.innerHTML = '';

        viagensComEnderecos.forEach(viagem => {
            const item = document.createElement('div');
            item.className = 'list-group-item';
            item.innerHTML = `
                <h5 class="mb-1">Viagem #${viagem.id}</h5>
                <span><strong>Origem:</strong> ${viagem.enderecoOrigem}</span><br>
                <span><strong>Destino:</strong> ${viagem.enderecoDestino}</span><br>
                <span><strong>Status:</strong> ${viagem.status}</span>
                ${viagem.status == "pendente" ? `</br><button class="btn btn-success mt-3" onclick="iniciarViagem(${viagem.id})">Iniciar Viagem</button>` : ""}
            `;

            container.appendChild(item);
        });

    } catch (error) {
        console.error('Erro ao carregar viagens:', error);
        container.innerHTML = `
            <div class="list-group-item text-danger text-center">
                Erro ao carregar viagens.
            </div>
        `;
    }
}

function getMotoristaIdDaUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function iniciarViagem(idViagem) {
  try {
    const response = await fetch(`http://localhost:3000/viagem/${idViagem}/iniciar`, {
      method: 'PATCH'
    });

    if (response.ok) {
      mostrarModal('Viagem iniciada com sucesso!');
      // Opcional: recarregar após fechar modal
      setTimeout(() => location.reload(), 2000);
    } else {
      const erro = await response.text();
      mostrarModal('Erro ao iniciar a viagem: ' + erro);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    mostrarModal('Erro inesperado ao iniciar a viagem.');
  }
}

function mostrarModal(mensagem) {
  const modalBody = document.getElementById('feedbackModalBody');
  modalBody.textContent = mensagem;

  const modal = new bootstrap.Modal(document.getElementById('feedbackModal'));
  modal.show();
}

async function getEndereco(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'EncomendaTrackerApp - email@exemplo.com'
        }
    });

    if (!response.ok) throw new Error('Falha ao buscar endereço');
    const data = await response.json();

    const address = data.address || {};

    const logradouro = address.road || '';
    const bairro = address.suburb || address.neighbourhood || '';
    const cidade = address.city || address.town || address.village || '';
    const estado = address.state || '';
    const cep = address.postcode || '';

    return `${logradouro}${bairro ? ', ' + bairro : ''}, ${cidade} - ${estado}, ${cep}`;
}

async function carregarViagemEmAndamento(motoristaId) {
    const container = document.querySelector('#andamento');
    container.innerHTML = `
      <div class="card">
      <div class="card-body text-center">
          <p class="card-text" id="viagem-andamento-loading">
              Carregando...
          </p>
      </div>
      </div>
  `;

    try {
        const response = await fetch(`${apiUrl}/viagem/listarViagens?status=em andamento&motorista=${motoristaId}`);
        const viagens = await response.json();
        if (viagens.length === 0) {
            container.innerHTML = `
              <div class="card">
                  <div class="card-body text-center">
                      <p class="card-text">Nenhuma viagem em andamento encontrada.</p>
                  </div>
              </div>
          `;
            return;
        }

        const viagem = viagens[0]; // só uma em andamento

        const [origem, destino] = await Promise.all([
            getEndereco(viagem.origem_lat, viagem.origem_lng),
            getEndereco(viagem.destino_lat, viagem.destino_lng)
        ]);

        const dataCriacaoFormatada = new Date(viagem.data_criacao).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        container.innerHTML = `
          <div class="card">
              <div class="card-body">
                  <h5 class="card-title">Viagem Ativa</h5>
                  <p class="card-text">
                      <strong>Origem:</strong> ${origem}<br>
                      <strong>Destino:</strong> ${destino}<br>
                      <strong>Iniciada em:</strong> ${dataCriacaoFormatada}<br>
                      <strong>Status:</strong> ${viagem.status}
                  </p>

                   <div id="map" style="height: 400px; width: 100%;"></div>
                   <div id="mapLoading" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:10px;border-radius:5px;z-index:9999;">
                     Carregando mapa...
                   </div>

                  <button class="btn btn-danger mt-3" onclick="encerrarViagem(${viagem.id})">Encerrar Viagem</button>
              </div>
          </div>
      `;

        iniciarMapaComAtualizacao(viagem);
    } catch (error) {
        console.error('Erro ao carregar viagem em andamento:', error);
        container.innerHTML = `
          <div class="card">
              <div class="card-body text-center text-danger">
                  Erro ao carregar viagem em andamento.
              </div>
          </div>
      `;
    }
}

async function encerrarViagem(idViagem) {
  try {
    const response = await fetch(`http://localhost:3000/viagem/${idViagem}/finalizar`, {
      method: 'PATCH'
    });

    if (response.ok) {
      mostrarModal('Viagem finalizada com sucesso!');
      setTimeout(() => location.reload(), 2000);
    } else {
      const erro = await response.text();
      mostrarModal('Erro ao finalizar a viagem: ' + erro);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    mostrarModal('Erro inesperado ao finalizar a viagem.');
  }
}

function iniciarMapaComAtualizacao(viagem) {
    if (!navigator.geolocation) {
        console.error('Geolocalização não suportada');
        return;
    }

    // Variável para armazenar o controle da rota
    let controleRota;

    navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        mapa = L.map('map').setView([lat, lng], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18
        }).addTo(mapa);

        setTimeout(() => {
            mapa.invalidateSize();
        }, 100);

        // Cria o controle de rota com seus estilos e opções
        controleRota = L.Routing.control({
            waypoints: [
                L.latLng(lat, lng),
                L.latLng(viagem.destino_lat, viagem.destino_lng)
            ],
            createMarker: function (i, waypoint) {
                const icon = L.icon({
                    iconUrl: i === 0
                        ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                        : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                });
                return L.marker(waypoint.latLng, { icon }).bindPopup(i === 0 ? 'Origem Atual' : 'Destino');
            },
            lineOptions: {
                styles: [{ color: 'blue', opacity: 0.6, weight: 5 }]
            },
            show: false,
            addWaypoints: false,
            routeWhileDragging: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true
        }).addTo(mapa);

        document.getElementById('mapLoading')?.remove();
    }, (err) => {
        console.error('Erro ao obter posição inicial:', err);
    });

    // Atualiza posição no watch e atualiza rota
    navigator.geolocation.watchPosition(async (pos) => {
        const novaLat = pos.coords.latitude;
        const novaLng = pos.coords.longitude;

        console.log("Atualizando... " + novaLat, novaLng);

        if (controleRota) {
            controleRota.setWaypoints([
                L.latLng(novaLat, novaLng),
                L.latLng(viagem.destino_lat, viagem.destino_lng)
            ]);
        }

        try {
            await fetch(`${apiUrl}/posicao/${viagem.id}/salvar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude: novaLat, longitude: novaLng })
            });
        } catch (e) {
            console.error('Erro ao enviar posição:', e);
        }
    }, (err) => {
        console.error('Erro ao atualizar localização:', err);
    }, {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000
    });
}
