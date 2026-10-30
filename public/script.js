const API_URL = "https://monitoramento-solo.onrender.com/api/dados";
const elemento = (id) => document.getElementById(id);

function mostrarStatus(conectado, mensagem) {
    elemento("statusConexao").textContent = mensagem;
    elemento("indicadorConexao").classList.toggle("online", conectado);
    elemento("indicadorConexao").classList.toggle("offline", !conectado);
}

function formatarNumero(valor, casas = 0) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "--";
    }

    return numero.toFixed(casas);
}

function atualizarInterface(dados) {
    const temperatura = Number(dados.temperatura);

    elemento("temperaturaC").textContent = formatarNumero(temperatura, 1);
    elemento("temperaturaF").textContent = Number.isFinite(temperatura)
        ? formatarNumero((temperatura * 9 / 5) + 32, 1)
        : "--";
    elemento("temperaturaK").textContent = Number.isFinite(temperatura)
        ? formatarNumero(temperatura + 273.15, 2)
        : "--";

    elemento("umidadeAr").textContent =
        `${formatarNumero(dados.umidade_ar, 1)}%`;

    elemento("umidadeSolo").textContent =
        formatarNumero(dados.umidade_solo);

    elemento("luminosidade").textContent =
        formatarNumero(dados.luz);

    const alertaChama = elemento("alertaChama");

    if (dados.alerta_chama === true) {
        alertaChama.textContent = "Chama detectada!";
        alertaChama.className = "estado alerta";
    } else if (dados.alerta_chama === false) {
        alertaChama.textContent = "Sem detecção";
        alertaChama.className = "estado normal";
    } else {
        alertaChama.textContent = "Sem informação";
        alertaChama.className = "estado neutro";
    }

    if (dados.estado_valvula !== undefined) {
        const valvula = elemento("estadoValvula");
        valvula.textContent = dados.estado_valvula;
        valvula.className = "estado neutro";
    }

    if (dados.ultima_atualizacao) {
        const data = new Date(dados.ultima_atualizacao);
        elemento("ultimaAtualizacao").textContent =
            `Última atualização: ${data.toLocaleTimeString("pt-BR")}`;
    } else {
        elemento("ultimaAtualizacao").textContent = "";
    }
}

async function atualizarDados() {
    try {
        const resposta = await fetch(API_URL, { cache: "no-store" });

        if (resposta.status === 404) {
            mostrarStatus(false, "Aguardando a primeira leitura do ESP32...");
            return;
        }

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();
        atualizarInterface(dados);
        mostrarStatus(true, "Conectado — recebendo dados");
    } catch (erro) {
        console.error("Erro ao buscar dados da API:", erro);
        mostrarStatus(false, "Não foi possível conectar à API");
    }
}

atualizarDados();
setInterval(atualizarDados, 2000);
