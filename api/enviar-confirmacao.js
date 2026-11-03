
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
        return res.status(405).json({ error: "Método não permitido." });
    }

    try {
        const {
            email,
            idAvaliador,
            emailAvaliador,
            idCondutor,
            dataHora,
            placa,
            tipo
        } = req.body || {};

        if (
            typeof email !== "string" ||
            email.length > 35 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return res.status(400).json({ error: "E-mail inválido." });
        }

        if (
            !/^\d{8}$/.test(idAvaliador || "") ||
            !/^\d{8}$/.test(idCondutor || "")
        ) {
            return res.status(400).json({ error: "IDs inválidos." });
        }

        if (
            emailAvaliador !== idAvaliador + "@ambev.com.br"
        ) {
            return res.status(400).json({ error: "E-mail do avaliador inválido." });
        }

        if (!/^[A-Z0-9]{7}$/.test(placa || "")) {
            return res.status(400).json({ error: "Placa inválida." });
        }

        if (!["CARRO", "MOTO"].includes(tipo)) {
            return res.status(400).json({ error: "Tipo de Blitz inválido." });
        }

        if (
            typeof dataHora !== "string" ||
            dataHora.length > 50
        ) {
            return res.status(400).json({ error: "Data/Hora inválida." });
        }

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
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: usuario,
                pass: senha
            }
        });

        const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; color: #333333; padding: 20px;">

            <h2 style="color: #0F3787;">BLITZ REALIZADA</h2>

            <p><strong>ID do Avaliador:</strong> ${escaparHTML(idAvaliador)}</p>

            <p><strong>E-mail do Avaliador:</strong> ${escaparHTML(emailAvaliador)}</p>

            <p><strong>ID do Condutor:</strong> ${escaparHTML(idCondutor)}</p>

            <p><strong>Data/Hora:</strong> ${escaparHTML(dataHora)}</p>

            <p><strong>Placa do Veículo:</strong> ${escaparHTML(placa)}</p>

            <p><strong>Tipo de Blitz:</strong> ${escaparHTML(tipo)}</p>

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
E-mail do Avaliador: ${emailAvaliador}
ID do Condutor: ${idCondutor}
Data/Hora: ${dataHora}
Placa do Veículo: ${placa}
Tipo de Blitz: ${tipo}

Registro realizado com sucesso no sistema de Blitz Veicular.
        `;

        const resultado = await transporter.sendMail({
            from: remetente,
            to: email,
            subject: "Blitz Veicular Realizada",
            text: texto,
            html: html
        });

        console.log("Gmail enviou o e-mail:", resultado.messageId);

        return res.status(200).json({
            success: true,
            message: "E-mail enviado com sucesso."
        });

    } catch (error) {
        console.error("ERRO GMAIL:", error);

        return res.status(502).json({
            error: "Falha no Gmail: " + (error.message || "Erro desconhecido.")
        });
    }
};
