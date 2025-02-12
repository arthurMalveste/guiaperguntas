const Sequelize = require('sequelize');
const connection = require('./database');

// Define o modelo 'Cadastro' com os campos 'usuario' e 'senha'
const Cadastro = connection.define('cadastro', {
    usuario: {
        type: Sequelize.STRING,
        allowNull: false // Não permite valores nulos
    },
    senha: {
        type: Sequelize.TEXT,
        allowNull: false // Não permite valores nulos
    }
});d

// Sincroniza o modelo com o banco de dados
Cadastro.sync({ force: false }).then(() => {
    // Tabela criada, se não existir
});

// Exporta o modelo 'Cadastro'
module.exports = Cadastro;