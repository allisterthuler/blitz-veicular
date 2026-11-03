    
// ===============================
// CONFIGURAÇÃO SUPABASE
// ===============================

const SUPABASE_URL = "https://dptxznkhhhuezhjixtvf.supabase.co";
const SUPABASE_KEY = "sb_publishable_mMejXWvyWg8n2V9_nMBJNQ_-E2e1rJP";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// ===============================
// PERGUNTAS
// ===============================

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

// ===============================
// ELEMENTOS
// ===============================

const tipoBlitz = document.getElementById("tipoBlitz");
const perguntasContainer = document.getElementById("perguntasContainer");
const comentarios = document.getElementById("comentarios");
const comentarioObrigatorio = document.getElementById("comentarioObrigatorio");

// ===============================
// DATA E HORA
// ===============================

function atualizarDataHora() {
    const agora = new Date();

    const data = agora.toLocaleDateString("pt-BR");
    const hora = agora.toLocaleTimeString("pt-BR");

    document.getElementById("dataHora").value = data + " " + hora;
}

atualizarDataHora();
setInterval(atualizarDataHora, 1000);

// ===============================
// MÁSCARAS
// ===============================

document.getElementById("idAvaliador").addEventListener("input", function() {
    this.value = this.value.replace(/\D/g, "").slice(0, 8);

    const id = this.value;
    const campoEmail = document.getElementById("emailConfirmacao");

    if (id.length === 8) {
        campoEmail.value = id + "@ambev.com.br";
    } else {
        campoEmail.value = "";
    }
});

document.getElementById("idCondutor").addEventListener("input", function() {
    this.value = this.value.replace(/\D/g, "").slice(0, 8);
});

document.getElementById("kmAtual").addEventListener("input", function() {
    this.value = this.value.replace(/\D/g, "");
});

document.getElementById("placaVeiculo").addEventListener("input", function() {
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
});

// ===============================
// CARREGAR PERGUNTAS
// ===============================

tipoBlitz.addEventListener("change", carregarPerguntas);

function carregarPerguntas() {
    perguntasContainer.innerHTML = "";

    const tipo = tipoBlitz.value;

    if (!tipo) return;

    perguntas[tipo].forEach((texto, index) => {
        const numero = index + 1;

        perguntasContainer.innerHTML += `
            <div class="pergunta">
                <h3>${numero}. ${texto}</h3>

                <div class="opcoes">
                    <div class="opcao">
                        <input
                            type="radio"
                            id="${tipo}_${numero}_ok"
                            name="${tipo}_${numero}"
                            value="true">

                        <label for="${tipo}_${numero}_ok">OK</label>
                    </div>

                    <div class="opcao">
                        <input
                            type="radio"
                            id="${tipo}_${numero}_nok"
                            name="${tipo}_${numero}"
                            value="false">

                        <label for="${tipo}_${numero}_nok">NOK</label>
                    </div>
                </div>
            </div>
        `;
    });

    adicionarEventosRadio();
}

// ===============================
// COMENTÁRIOS OBRIGATÓRIO
// ===============================

function adicionarEventosRadio() {
    document.querySelectorAll("input[type=radio]").forEach(radio => {
        radio.addEventListener("change", verificarComentarios);
    });
}

function verificarComentarios() {
    let existeNok = false;

    document.querySelectorAll("input[type=radio]:checked").forEach(r => {
        if (r.value === "false") {
            existeNok = true;
        }
    });

    if (existeNok) {
        comentarios.required = true;
        comentarioObrigatorio.innerHTML = "* obrigatório quando houver NOK";
        comentarios.style.border = "2px solid red";
    } else {
        comentarios.required = false;
        comentarioObrigatorio.innerHTML = "";
        comentarios.style.border = "";
    }
}

// ===============================
// ENVIO DO FORMULÁRIO
// ===============================

document.getElementById("blitzForm").addEventListener("submit", salvarBlitz);

async function salvarBlitz(e) {
    e.preventDefault();

    const mensagem = document.getElementById("mensagem");
    const btnEnviar = document.getElementById("btnEnviar");

    mensagem.innerHTML = "";
    mensagem.className = "";

    const idAvaliador = document.getElementById("idAvaliador").value.trim();
    const idCondutor = document.getElementById("idCondutor").value.trim();
    const placa = document.getElementById("placaVeiculo").value.trim().toUpperCase();
    const tipo = document.getElementById("tipoBlitz").value;
    const km = document.getElementById("kmAtual").value.trim();
    const comentariosTexto = document.getElementById("comentarios").value.trim();
    const emailConfirmacao = document.getElementById("emailConfirmacao").value.trim();
    const dataHoraRegistro = document.getElementById("dataHora").value;

    // ==========================
    // VALIDAÇÕES
    // ==========================

    if (!/^\d{8}$/.test(idAvaliador)) {
        return mostrarErro("ID Avaliador deve possuir exatamente 8 números.");
    }

    if (!/^\d{8}$/.test(idCondutor)) {
        return mostrarErro("ID Condutor deve possuir exatamente 8 números.");
    }

    if (!/^[A-Z0-9]{7}$/.test(placa)) {
        return mostrarErro("Placa inválida.");
    }

    if (!tipo) {
        return mostrarErro("Selecione o tipo de blitz.");
    }

    if (!/^\d+$/.test(km)) {
        return mostrarErro("KM Atual deve conter somente números.");
    }

    if (
        emailConfirmacao.length > 35 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailConfirmacao)
    ) {
        return mostrarErro("Informe um e-mail válido com até 35 caracteres.");
    }

    let respostas = {};
    let existeNok = false;

    const totalPerguntas = perguntas[tipo].length;

    for (let i = 1; i <= totalPerguntas; i++) {
        const resposta = document.querySelector(
            `input[name="${tipo}_${i}"]:checked`
        );

        if (!resposta) {
            return mostrarErro("Responda todas as perguntas.");
        }

        const valor = resposta.value === "true";
        respostas[i] = valor;

        if (!valor) {
            existeNok = true;
        }
    }

    if (existeNok && comentariosTexto === "") {
        return mostrarErro("Informe os comentários quando houver alguma resposta NOK.");
    }

    btnEnviar.disabled = true;
    btnEnviar.innerHTML = "Salvando...";

    try {

        // ==========================
        // MONTA REGISTRO
        // ==========================

        let registro = {
            id_avaliador: idAvaliador,
            id_condutor: idCondutor,
            placa_veiculo: placa,
            tipo_blitz: tipo,
            km_atual: km,
            comentarios: comentariosTexto
        };

        for (let i = 1; i <= 11; i++) {
            registro["carro_q" + i] = null;
        }

        for (let i = 1; i <= 16; i++) {
            registro["moto_q" + i] = null;
        }

        if (tipo === "CARRO") {
            for (let i = 1; i <= 11; i++) {
                registro["carro_q" + i] = respostas[i];
            }
        }

        if (tipo === "MOTO") {
            for (let i = 1; i <= 16; i++) {
                registro["moto_q" + i] = respostas[i];
            }
        }

        // ==========================
        // GRAVA NO SUPABASE
        // ==========================

        const { error } = await supabaseClient
            .from("blitz_veicular")
            .insert([registro]);

        if (error) {
            console.error("Erro Supabase:", error);
            return mostrarErro("Erro ao gravar os dados no Supabase.");
        }

        // ==========================
        // ENVIA E-MAIL DE CONFIRMAÇÃO
        // ==========================

        btnEnviar.innerHTML = "Enviando confirmação...";

        let emailEnviado = false;

        try {
           const respostaEmail = await fetch("/api/enviar-confirmacao", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        email: emailConfirmacao,
        idAvaliador: idAvaliador,
        emailAvaliador: idAvaliador + "@ambev.com.br",
        idCondutor: idCondutor,
        dataHora: dataHoraRegistro,
        placa: placa,
        tipo: tipo
    })
});

            const resultadoEmail = await respostaEmail.json();

            if (!respostaEmail.ok) {
                throw new Error(resultadoEmail.error || "Falha no envio do e-mail.");
            }

            emailEnviado = true;

        } catch (erroEmail) {
            console.error("Erro ao enviar confirmação:", erroEmail);
        }

        // ==========================
        // RESULTADO
        // ==========================

        if (emailEnviado) {
            mostrarSucesso(
                "Blitz registrada com sucesso! A confirmação foi enviada para " + emailConfirmacao + "."
            );
        } else {
            mostrarSucesso(
                "Blitz registrada com sucesso no Supabase! ATENÇÃO: não foi possível enviar o e-mail de confirmação."
            );
        }

        document.getElementById("blitzForm").reset();

        perguntasContainer.innerHTML = "";
        atualizarDataHora();

        comentarios.required = false;
        comentarioObrigatorio.innerHTML = "";
        comentarios.style.border = "";

    } catch (erro) {
        console.error("Erro:", erro);
        mostrarErro("Ocorreu um erro ao registrar a Blitz.");
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = "Enviar Blitz";
    }
}

// ===============================
// MENSAGENS
// ===============================

function mostrarErro(texto) {
    const mensagem = document.getElementById("mensagem");
    mensagem.className = "erro";
    mensagem.innerHTML = texto;
}

function mostrarSucesso(texto) {
    const mensagem = document.getElementById("mensagem");
    mensagem.className = "sucesso";
    mensagem.innerHTML = texto;
}
