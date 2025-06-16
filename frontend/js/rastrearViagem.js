const apiUrl = 'http://localhost:3000/viagem';

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

let atualizarMapaInterval = null;
let map = null;
let marcadorMotorista = null;
let routingControl = null;

document.getElementById('trackingCodeBtn').addEventListener('click', async () => {
  const codigo = document.getElementById('trackingCode').value.trim();
  const modalContent = document.getElementById('modalContent');
  const modalElement = document.getElementById('trackingResultsModal');
  const modal = new bootstrap.Modal(modalElement);

  if (!codigo) {
    modalContent.innerHTML = `<p class="text-danger">Por favor, insira um código de rastreamento.</p>`;
    modal.show();
    return;
  }

  modalContent.innerHTML = `<p>Carregando...</p>`;
  modal.show();

  async function inicializarMapa() {
    try {
      const response = await fetch(`${apiUrl}/codigo/${encodeURIComponent(codigo)}`);
      if (!response.ok) {
        const erro = await response.json();
        modalContent.innerHTML = `<p class="text-danger">${erro.erro || 'Erro ao buscar viagem.'}</p>`;
        return;
      }

      const viagem = await response.json();

      const dataCriacaoFormatada = new Date(viagem.data_criacao).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const dataEntregaFormatada = viagem.data_entrega
        ? new Date(viagem.data_entrega).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
        : null;

      modalContent.innerHTML = `<p>Carregando endereços...</p>`;

      const [enderecoOrigem, enderecoDestino] = await Promise.all([
        getEndereco(viagem.origem_lat, viagem.origem_lng),
        getEndereco(viagem.destino_lat, viagem.destino_lng)
      ]);

      modalContent.innerHTML = `
        <p><strong>Status:</strong> ${getStatusComIcone(viagem.status)}</p>
        <p><strong>Origem:</strong> ${enderecoOrigem}</p>
        <p><strong>Destino:</strong> ${enderecoDestino}</p>
        <p><strong>Descrição da carga:</strong> ${viagem.descricao_carga || 'N/A'}</p>
        <p><strong>Placa do caminhão:</strong> ${viagem.placa_caminhao}</p>
        <p><strong>Nome do Motorista:</strong> ${getNomeMotorista(viagem.motoristaId)}</p>
        <p><strong>Data de criação:</strong> ${dataCriacaoFormatada}</p>
        ${dataEntregaFormatada ? `<p><strong>Data de entrega:</strong> ${dataEntregaFormatada}</p>` : ''}
        <div style="height: 300px; margin-top: 1rem; position: relative;">
          <div id="map" style="height: 100%;"></div>
          <div id="mapLoading" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:10px;border-radius:5px;z-index:9999;">
            Carregando mapa...
          </div>
        </div>
      `;

      setTimeout(() => {
        const origem = [viagem.origem_lat, viagem.origem_lng];
        const destino = [viagem.destino_lat, viagem.destino_lng];
        const ultima_latitude = viagem.ultima_latitude || viagem.origem_lat;
        const ultima_longitude = viagem.ultima_longitude || viagem.origem_lng;

        // Cria o mapa se não existir
        if (!map) {
          map = L.map('map').setView([ultima_latitude, ultima_longitude], 6);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
          }).addTo(map);

          // Cria marcador origem
          L.marker(origem, {
            icon: L.icon({
              iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            })
          }).bindPopup('Origem').addTo(map);

          // Cria marcador destino
          L.marker(destino, {
            icon: L.icon({
              iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            })
          }).bindPopup('Destino').addTo(map);

          // Cria marcador móvel motorista (última posição)
          marcadorMotorista = L.marker([ultima_latitude, ultima_longitude], {
            icon: L.icon({
              iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            })
          }).bindPopup('Posição Atual do Motorista').addTo(map);

          // Opcional: controle de rota (se quiser)
          if (routingControl) {
            map.removeControl(routingControl);
          }
          routingControl = L.Routing.control({
            waypoints: [
              L.latLng([ultima_latitude, ultima_longitude]),
              L.latLng(destino)
            ],
            lineOptions: {
              styles: [{ color: 'blue', opacity: 0.6, weight: 5 }]
            },
            createMarker: () => { return null; },
            addWaypoints: false,
            routeWhileDragging: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            show: false,
          }).addTo(map);

        } else {
          // Se mapa já existe, atualiza posição do marcador motorista
          marcadorMotorista.setLatLng([ultima_latitude, ultima_longitude]);

          // Atualiza rota também
          routingControl.setWaypoints([
            L.latLng([ultima_latitude, ultima_longitude]),
            L.latLng(destino)
          ]);
        }

        document.getElementById('mapLoading')?.remove();
        modalContent.scrollTop = modalContent.scrollHeight;
      }, 200);

    } catch (err) {
      modalContent.innerHTML = `<p class="text-danger">Erro inesperado ao buscar a viagem ou endereço.</p>`;
    }
  }

  // Chama pela primeira vez
  await inicializarMapa();

  // Limpa intervalo anterior
  if (atualizarMapaInterval) {
    clearInterval(atualizarMapaInterval);
  }

  // A cada 10 segundos, busca só a última posição e atualiza marcador
  atualizarMapaInterval = setInterval(async () => {
    try {
      const response = await fetch(`${apiUrl}/codigo/${encodeURIComponent(codigo)}`);
      if (!response.ok) return; // Se erro, ignora
      const viagem = await response.json();

      const ultima_latitude = viagem.ultima_latitude || viagem.origem_lat;
      const ultima_longitude = viagem.ultima_longitude || viagem.origem_lng;
      const destino = [viagem.destino_lat, viagem.destino_lng];

      if (marcadorMotorista && map && routingControl) {
        marcadorMotorista.setLatLng([ultima_latitude, ultima_longitude]);
        routingControl.setWaypoints([
          L.latLng([ultima_latitude, ultima_longitude]),
          L.latLng(destino)
        ]);
      }
    } catch {
      // Só ignora erros no update periódico
    }
  }, 10000);

  // Limpa tudo quando modal fechar
  modalElement.addEventListener('hidden.bs.modal', () => {
    clearInterval(atualizarMapaInterval);
    atualizarMapaInterval = null;

    if (map) {
      map.remove();
      map = null;
      marcadorMotorista = null;
      routingControl = null;
    }
  }, { once: true });

});

function getStatusComIcone(status) {
    switch (status.toLowerCase()) {
        case 'em andamento':
            return `<i class="bi bi-truck text-primary"></i> Em andamento`;
        case 'entregue':
            return `<i class="bi bi-check-circle-fill text-success"></i> Entregue`;
        case 'pendente':
            return `<i class="bi bi-hourglass-split text-warning"></i> Pendente`;
        default:
            return `<i class="bi bi-question-circle text-secondary"></i> Desconhecido`;
    }
}

function getNomeMotorista(id) {
    const motoristas = {
        1: "João Silva",
        2: "Maria Souza",
        3: "Carlos Oliveira",
        4: "Fernanda Lima",
        5: "Ricardo Alves"
    };

    return motoristas[id] || "Motorista desconhecido";
}
