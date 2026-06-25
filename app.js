const SUPABASE_URL = "https://yjlrrkbawzcqkraiacuj.supabase.co";
const SUPABASE_KEY = "sb_publishable_8xegeKoga0ybitodQu-8nA_QBtbYz60";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const perguntas = {

    CARRO: [
        "Estado de conservação do pneu (TWI)",
        "Funcionamento das setas",
        "Funcionamento dos faróis",
        "Funcionamento da luz de freio",
        "Funcionamento da luz de ré",
        "Funcionamento da buzina",
        "Funcionamento do limpador e se possui água",
        "Cinto de segurança está em bom estado e a trava está funcionando",
        "5S do veículo",
        "Objetos somente no porta-malas",
        "Veículo sem avarias"
    ],

    MOTO: [
        "Estado de conservação do pneu (TWI)",
        "Funcionamento das setas",
        "Funcionamento dos faróis",
        "Funcionamento da luz de freio",
        "Funcionamento da buzina",
        "Folga na corrente (máximo 2 cm)",
        "Baú com trava",
        "Antena corta-pipa",
        "Estado de conservação da botina",
        "Estado de conservação da jaqueta",
        "Estado de conservação da calça com reforço",
        "Estado de conservação do capacete",
        "Estado de conservação da viseira",
        "Jugular sem folga",
        "Estado de conservação da luva de moto",
        "Veículo sem avarias"
    ]
};

const tipoSelect = document.getElementById("tipoBlitz");
const perguntasContainer = document.getElementById("perguntasContainer");
const mensagem = document.getElementById("mensagem");

tipoSelect.addEventListener("change", carregarPerguntas);

function carregarPerguntas() {

    perguntasContainer.innerHTML = "";

    const tipo = tipoSelect.value;

    if (!tipo) return;

    perguntas[tipo].forEach((texto, index) => {

        const numero = index + 1;

        perguntasContainer.innerHTML += `
            <div class="pergunta">

                <div class="pergunta-titulo">
                    ${numero}. ${texto}
                </div>

                <div class="opcoes">

                    <div class="opcao">
                        <input
                            type="radio"
                            id="${tipo}_${numero}_ok"
                            name="${tipo}_${numero}"
                            value="true"
                        >
                        <label for="${tipo}_${numero}_ok">
                            OK
                        </label>
                    </div>

                    <div class="opcao">
                        <input
                            type="radio"
                            id="${tipo}_${numero}_nok"
                            name="${tipo}_${numero}"
                            value="false"
                        >
                        <label for="${tipo}_${numero}_nok">
                            NOK
                        </label>
                    </div>

                </div>

            </div>
        `;
    });
}

document
    .getElementById("blitzForm")
    .addEventListener("submit", salvarBlitz);

async function salvarBlitz(e) {

    e.preventDefault();

    mensagem.innerHTML = "";
    mensagem.className = "";

    const idAvaliador =
        document.getElementById("idAvaliador").value.trim();

    const idAvaliado =
        document.getElementById("idAvaliado").value.trim();

    const placaVeiculo =
        document.getElementById("placaVeiculo").value.trim();

    const tipo =
        document.getElementById("tipoBlitz").value;

    const kmAtual =
        document.getElementById("kmAtual").value.trim();

    const comentarios =
        document.getElementById("comentarios").value.trim();

    if (
        !idAvaliador ||
        !idAvaliado ||
        !placaVeiculo ||
        !tipo ||
        !kmAtual
    ) {
        mostrarErro("Preencha todos os campos obrigatórios.");
        return;
    }

    const respostas = {};

    for (let i = 1; i <= perguntas[tipo].length; i++) {

        const resposta = document.querySelector(
            `input[name="${tipo}_${i}"]:checked`
        );

        if (!resposta) {
            mostrarErro("Responda todas as perguntas.");
            return;
        }

        respostas[i] = resposta.value === "true";
    }

    const registro = {

        id_avaliador: idAvaliador,
        id_avaliado: idAvaliado,
        placa_veiculo: placaVeiculo,

        tipo_blitz: tipo,

        km_atual: kmAtual,

        comentarios: comentarios || null
    };

    for (let i = 1; i <= 11; i++) {
        registro[`carro_q${i}`] = null;
    }

    for (let i = 1; i <= 16; i++) {
        registro[`moto_q${i}`] = null;
    }

    if (tipo === "CARRO") {

        for (let i = 1; i <= 11; i++) {
            registro[`carro_q${i}`] = respostas[i];
        }

    } else {

        for (let i = 1; i <= 16; i++) {
            registro[`moto_q${i}`] = respostas[i];
        }

    }

    const { error } = await supabaseClient
        .from("blitz_veicular")
        .insert([registro]);

    if (error) {

        console.error(error);

        mostrarErro("Erro ao salvar blitz.");

        return;
    }

    mostrarSucesso(
        "Blitz registrada com sucesso!"
    );

    document
        .getElementById("blitzForm")
        .reset();

    perguntasContainer.innerHTML = "";
}

function mostrarErro(texto) {

    mensagem.className = "erro";
    mensagem.innerHTML = texto;
}

function mostrarSucesso(texto) {

    mensagem.className = "sucesso";
    mensagem.innerHTML = texto;
}

const placaVeiculo =
    document.getElementById("placaVeiculo")
    .value
    .trim()
    .toUpperCase();

<input
    type="number"
    id="kmAtual"
    required
>