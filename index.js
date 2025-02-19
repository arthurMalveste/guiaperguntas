const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const connection = require("./database/database")
const Pergunta = require("./database/pergunta")
const Resposta = require("./database/Resposta")
const Cadastro = require("./database/Cadastro")
const session = require("express-session")

// let path = require('path');

app.use(session({
    secret: "qualquer",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 } //   30 minutos
}))

var menssagem = false

//database
connection
    .authenticate()
    .then(() => {
        console.log("conexao feita com o banco de dados")
    })
    .catch((msgErro)=> {
        console.log(msgErro)
    })

app.set('view engine', 'ejs') // Dizendo ao express que é para usar o ejs 
app.use(express.static('public'))

// body parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// exibir variavel <%= nome da variavel %>
// usar condicional no html <% if(){ %>
//  "hmtl" 
// <% } %>

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}


app.get("/", (req, res) => {
    title = "Home"
    if(req.session.user){
        var user = req.session.user
        console.log(user)
    }else{
        console.log("Não logado")
    }
    Pergunta.findAll({ raw: true, order:[
        ['id', 'DESC'] // ASC = crescente || DESC = decrescente
    ] }).then(perguntas => {
        res.render("index", {
            perguntas: perguntas,
            menssagem: menssagem,
            user: req.session.user
        });
        menssagem = false; // Reset the message after rendering
    });
    
});

app.get("/perguntar", isAuthenticated, (req, res)=>{
    title = "Ask"
    res.render("perguntar")
})

app.post("/salvarpergunta", isAuthenticated, (req, res)=>{
    var titulo = req.body.titulo
    var descricao = req.body.descricao

    Pergunta.create({ // inserindo dados no banco de dados
        titulo: titulo,     // salva no titulo do banco de dados o titulo que foi definido pelo variavel
        descricao: descricao
    }).then(()=>{
        res.redirect("/")
    })
})

app.get("/pergunta/:id", (req, res) => {
    var id = req.params.id;
    title = "Question"
    Pergunta.findOne({
        where: { id: id }
    }).then(pergunta => {
        if (pergunta != undefined) { // pergunta encontrada
            Resposta.findAll({
                raw: true, order:[
                    ['id', 'DESC'] // ASC = crescente || DESC = decrescente
                ],
                where: { perguntaId: pergunta.id }
            }).then(respostas => {
                res.render("pergunta", {
                    pergunta: pergunta,
                    respostas: respostas,
                    createdAt: pergunta.createdAt
                });
            });
        } else { // pergunta não encontrada
            menssagem = true;
            res.redirect("/");
        }
    });
});

app.post("/responder", isAuthenticated, (req, res)=>{
    var corpo = req.body.corpo
    var perguntaId = req.body.pergunta

    Resposta.create({
        corpo: corpo,
        perguntaId: perguntaId
    }).then(()=>{
        res.redirect("/pergunta/"+perguntaId)
    })
})

app.get("/cadastrar", (req, res) => {
    title = "Register";
    res.render("cadastrar", { msgErro: null });
});

app.get("/Login", (req, res) => {
    title = "Login";
    res.render("login", { msgErro: null });
});

app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    Cadastro.findOne({ where: { usuario: usuario, senha: senha } }).then(user => {
        if (user) {
            req.session.user = user; // Armazena as informações do usuário na sessão
            res.redirect('/');
        } else {
            res.render('login', { msgErro: 'Usuário ou senha incorretos' });
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

app.post("/salvarcadastro", (req, res) => {
    var usuario = req.body.usuario;
    var senha = req.body.senha;
    var confirmacaoSenha = req.body.confirmacaoSenha;

    if (senha == confirmacaoSenha) {
        Cadastro.findOne({ where: { usuario: usuario } }).then(user => {
            if (user) {
                // Usuário já existe
                res.render("cadastrar", { msgErro: "Usuário já existe" });
            } else {
                // Usuário não existe, criar novo cadastro
                Cadastro.create({
                    usuario: usuario,
                    senha: senha,
                }).then(() => {
                    res.redirect("/");
                });
            }
        });
    } else {
        res.render("cadastrar", { msgErro: "As senhas não coincidem" });
    }
});

app.listen(8080, ()=>{
    console.log("app rodando")
})