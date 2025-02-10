const connection = require("./database");
const Pergunta = require("./pergunta");
const Resposta = require("./Resposta");

async function clearDatabase() {
    try {
        await connection.sync({ force: true });
        console.log("Banco de dados limpo com sucesso!");
    } catch (error) {
        console.error("Erro ao limpar o banco de dados:", error);
    } finally {
        process.exit();
    }
}

clearDatabase();
