import { createClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CABECALHOS = {

    data_registro: "Data da Blitz",

    id_avaliador: "ID Avaliador",

    id_condutor: "ID Condutor",

    placa_veiculo: "Placa do Veículo",

    tipo_blitz: "Veículo",

    carro_q1: "CARRO - Estado de conservação do pneu (TWI):",

    carro_q2: "CARRO - Funcionamento das setas:",

    carro_q3: "CARRO - Funcionamento dos faróis:",

    carro_q4: "CARRO - Funcionamento da luz de freio:",

    carro_q5: "CARRO - Funcionamento da luz de ré:",

    carro_q6: "CARRO - Funcionamento da buzina:",

    carro_q7: "CARRO - Funcionamento do limpador e se possui água:",

    carro_q8: "CARRO - Cinto de segurança está em bom estado e a trava está funcionando:",

    carro_q9: "CARRO - 5S do veículo:",

    carro_q10: "CARRO - Objetos somente no porta-malas:",

    carro_q11: "CARRO - Veículo sem avarias:",

    moto_q1: "MOTO - Estado de conservação do pneu (TWI):",

    moto_q2: "MOTO - Funcionamento das setas:",

    moto_q3: "MOTO - Funcionamento dos faróis:",

    moto_q4: "MOTO - Funcionamento da luz de freio:",

    moto_q5: "MOTO - Funcionamento da buzina:",

    moto_q6: "MOTO - Folga na corrente (máximo 2 cm):",

    moto_q7: "MOTO - Baú com trava:",

    moto_q8: "MOTO - Antena Corta Pipa:",

    moto_q9: "MOTO - Estado de conservação da botina:",

    moto_q10: "MOTO - Estado de conservação da jaqueta:",

    moto_q11: "MOTO - Estado de conservação da calça com reforço:",

    moto_q12: "MOTO - Estado de conservação do capacete:",

    moto_q13: "MOTO - Estado de conservação da viseira:",

    moto_q14: "MOTO - Jugular sem folga:",

    moto_q15: "MOTO - Estado de conservação da luva de moto:",

    moto_q16: "MOTO - Veículo sem avarias:",

    km_atual: "KM Atual",

    comentarios: "Comentários"

};

async function buscarTodosRegistros() {

    let todos = [];

    let inicio = 0;

    const lote = 1000;

    while (true) {

        const { data, error } = await supabase
            .from("blitz_veicular")
            .select("*")
            .range(inicio, inicio + lote - 1);

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            break;
        }

        todos.push(...data);

        if (data.length < lote) {
            break;
        }

        inicio += lote;
    }

    return todos;
}

export default async function handler(req, res) {

    try {

        const registros = await buscarTodosRegistros();

        const workbook = new ExcelJS.Workbook();

        const worksheet =
            workbook.addWorksheet("Blitz Veicular");