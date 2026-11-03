
const nodemailer = require("nodemailer");

function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, caractere => {
        const entidades = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entidades[caractere];
    });
}

module.exports = async (req, res) => {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Método não permitido."
        });
    }

    try {

        const {
            email,
            idAvaliador,
            idCondutor,
            dataHora
        } = req.body || {};

        // VALIDAÇÕES

        if (
            typeof email !== "string" ||
            email.length > 35 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return res.status(400).json({
                error: "E-mail inválido."
            });
        }

        if (
            !/^\d{8}$/.test(idAvaliador || "") ||
            !/^\d{8}$/.test(idCondutor || "")
        ) {
            return res.status(400).json({
                error: "IDs inválidos."
            });
        }

        if (
            typeof dataHora !== "string" ||
            dataHora.length > 50
        ) {
            return res.status(400).json({
                error: "Data/Hora inválida."
            });
        }

        // CONFIGURAÇÃO GMAIL

        const usuario = process.env.SMTP_USER;
        const senha = process.env.SMTP_PASS;
        const remetente = process.env.SMTP_FROM;

        if (!usuario || !senha || !remetente) {
            console.error("Configuração SMTP incompleta.");

            return res.status(500).json({
                error: "Serviço de e-mail não configurado."
            });
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT || 465),
            secure: process.env.SMTP_SECURE === "true",

            auth: {
                user: usuario,
                pass: senha
            }
        });

        // CONTEÚDO DO E-MAIL

        const avaliadorHTML = escaparHTML(idAvaliador);
        const condutorHTML = escaparHTML(idCondutor);
        const dataHTML = escaparHTML(dataHora);

        const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
        </head>

        <body style="font-family: Arial, sans-serif; color: #333333; padding: 20px;">

            <h2 style="color: #0F3787;">
                BLITZ REALIZADA
            </h2>

            <p>
                <strong>ID do Avaliador:</strong>
                ${avaliadorHTML}
            </p>

            <p>
                <strong>ID do Condutor:</strong>
                ${condutorHTML}
            </p>

            <p>
                <strong>Data/Hora:</strong>
                ${dataHTML}
            </p>

            <br>

            <p style="color: #198754;">
                Registro realizado com sucesso no sistema de Blitz Veicular.
            </p>

            <hr>

            <small>Ambev - Blitz Veicular</small>

        </body>
        </html>
        `;

        const texto = `
BLITZ REALIZADA

ID do Avaliador: ${idAvaliador}

ID do Condutor: ${idCondutor}

Data/Hora: ${dataHora}

Registro realizado com sucesso no sistema de Blitz Veicular.
        `;

        // ENVIO

        const resultado = await transporter.sendMail({

            from: remetente,

            to: email,

            subject: "Blitz Veicular Realizada",

            text: texto,

            html: html

        });

        console.log("E-mail enviado:", resultado.messageId);

        return res.status(200).json({
            success: true,
            message: "E-mail enviado com sucesso."
        });

    } catch (error) {

        console.error("Erro no envio pelo Gmail:", error);

        return res.status(502).json({
            error: "Não foi possível enviar o e-mail pelo Gmail."
        });

    }
};

    }

    try {

        const {
            email,
            idAvaliador,
            idCondutor,
            dataHora
        } = req.body || {};

        // ==========================
        // VALIDAÇÕES
        // ==========================

        if (
            typeof email !== "string" ||
            email.length > 35 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return res.status(400).json({
                error: "E-mail inválido."
            });
        }

        if (
            !/^\d{8}$/.test(idAvaliador || "") ||
            !/^\d{8}$/.test(idCondutor || "")
        ) {
            return res.status(400).json({
                error: "IDs inválidos."
            });
        }

        if (
            typeof dataHora !== "string" ||
            dataHora.length > 50
        ) {
            return res.status(400).json({
                error: "Data/Hora inválida."
            });
        }

        // ==========================
        // CONFIGURAÇÃO RESEND
        // ==========================

        const API_KEY = process.env.RESEND_API_KEY;

        const EMAIL_ORIGEM = process.env.RESEND_FROM_EMAIL;

        if (!API_KEY || !EMAIL_ORIGEM) {

            console.error(
                "Variáveis do Resend não configuradas."
            );

            return res.status(500).json({
                error: "Serviço de e-mail não configurado."
            });

        }

        // ==========================
        // MONTAGEM DO E-MAIL
        // ==========================

        const avaliadorHTML = escaparHTML(idAvaliador);
        const condutorHTML = escaparHTML(idCondutor);
        const dataHTML = escaparHTML(dataHora);

        const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
        </head>

        <body style="
            font-family: Arial, sans-serif;
            color: #333333;
            padding: 20px;
        ">

            <h2 style="color: #0F3787;">
                BLITZ REALIZADA
            </h2>

            <p>
                <strong>ID do Avaliador:</strong>
                ${avaliadorHTML}
            </p>

            <p>
                <strong>ID do Condutor:</strong>
                ${condutorHTML}
            </p>

            <p>
                <strong>Data/Hora:</strong>
                ${dataHTML}
            </p>

            <br>

            <p style="color: #198754;">
                Registro realizado com sucesso no sistema
                de Blitz Veicular.
            </p>

            <hr>

            <small>
                Ambev - Blitz Veicular
            </small>

        </body>
        </html>
        `;

        const texto = `
BLITZ REALIZADA

ID do Avaliador: ${idAvaliador}

ID do Condutor: ${idCondutor}

Data/Hora: ${dataHora}

Registro realizado com sucesso no sistema de Blitz Veicular.
        `;

        // ==========================
        // ENVIO PELO RESEND
        // ==========================

        const resposta = await fetch(
            "https://api.resend.com/emails",
            {

                method: "POST",

                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    from: EMAIL_ORIGEM,

                    to: [email],

                    subject: "Blitz Veicular Realizada",

                    html: html,

                    text: texto

                })

            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {

            console.error(
                "Erro Resend:",
                resultado
            );

            return res.status(502).json({
                error: "O Resend não conseguiu enviar o e-mail."
            });

        }

        return res.status(200).json({

            success: true,

            message: "E-mail enviado com sucesso.",

            id: resultado.id

        });

    } catch (error) {

        console.error("Erro na API:", error);

        return res.status(500).json({
            error: "Erro interno ao enviar confirmação."
        });

    }

};
