const SUPABASE_URL = "https://dptxznkhhhuezhjixtvf.supabase.co";
const SUPABASE_KEY = "sb_publishable_mMejXWvyWg8n2V9_nMBJNQ_-E2e1rJP";

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

const tipoBlitz = document.getElementById("tipoBlitz");
const perguntasContainer = document.getElementById("perguntasContainer");
const mensagem = document.getElementById("mensagem");
const btnEnviar = document.getElementById("btnEnviar");

tipoBlitz.addEventListener("change", carregarPerguntas);

function carregarPerguntas() {

    perguntasContainer.innerHTML = "";

    const tipo = tipoBlitz.value;

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
                            value="true">

                        <label for="${tipo}_${numero}_ok">
                            OK
                        </label>
                    </div>

                    <div class="opcao">
                        <input
                            type="radio"
                            id="${tipo}_${numero}_nok"
                            name="${tipo}_${numero}"
                            value="false">

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
        document.getElementById("idAvaliador")
        .value.trim();

    const idCondutor =
        document.getElementById("idCondutor")
        .value.trim();

    const placaVeiculo =
        document.getElementById("placaVeiculo")
        .value
        .trim()
        .toUpperCase();

    const kmAtual =
        document.getElementById("kmAtual")
        .value.trim();

    const comentarios =
        document.getElementById("comentarios")
        .value.trim();

    const tipo =
        document.getElementById("tipoBlitz")
        .value;

    if (!/^\d{8}$/.test(idAvaliador)) {
        mostrarErro("ID Avaliador deve possuir 8 dígitos.");
        return;
    }

    if (!/^\d{8}$/.test(idCondutor)) {
        mostrarErro("ID Condutor deve possuir 8 dígitos.");
        return;
    }

    if (!/^[A-Z0-9]{7}$/.test(placaVeiculo)) {
        mostrarErro(
            "Placa inválida. Utilize exatamente 7 caracteres sem símbolos."
        );
        return;
    }

    if (!/^\d+$/.test(kmAtual)) {
        mostrarErro(
            "KM Atual deve conter apenas números."
        );
        return;
    }

    if (!comentarios) {
        mostrarErro(
            "Comentários é obrigatório."
        );
        return;
    }

    const respostas = {};

    for (let i = 1; i <= perguntas[tipo].length; i++) {

        const resposta = document.querySelector(
            `input[name="${tipo}_${i}"]:checked`
        );

        if (!resposta) {

            mostrarErro(
                "Responda todas as perguntas."
            );

            return;
        }

        respostas[i] =
            resposta.value === "true";
    }

    btnEnviar.disabled = true;

    const registro = {

        id_avaliador: idAvaliador,

        id_condutor: idCondutor,

        placa_veiculo: placaVeiculo,

        tipo_blitz: tipo,

        km_atual: kmAtual,

        comentarios: comentarios
    };

    for (let i = 1; i <= 11; i++) {
        registro[`carro_q${i}`] = null;
    }

    for (let i = 1; i <= 16; i++) {
        registro[`moto_q${i}`] = null;
    }

    if (tipo === "CARRO") {

        for (let i = 1; i <= 11; i++) {
            registro[`carro_q${i}`] =
                respostas[i];
        }

    } else {

        for (let i = 1; i <= 16; i++) {
            registro[`moto_q${i}`] =
                respostas[i];
        }

    }

    const { error } =
        await supabaseClient
            .from("blitz_veicular")
            .insert([registro]);

    btnEnviar.disabled = false;

    if (error) {

        console.error(error);

        mostrarErro(
            error.message
        );

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

document.getElementById("idAvaliador")
.addEventListener("input", function() {
    this.value = this.value.replace(/\D/g, "");
});

document.getElementById("idCondutor")
.addEventListener("input", function() {
    this.value = this.value.replace(/\D/g, "");
});

document.getElementById("placaVeiculo")
.addEventListener("input", function() {

    this.value = this.value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
});