const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const connection = require("./database/database")
const Pergunta = require("./database/pergunta")

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


app.get("/", (req, res) => {
    title = "Home"
    Pergunta.findAll({ raw: true, order:[
        ['id', 'DESC'] // ASC = crescente || DESC = decrescente
    ] }).then(perguntas => {
        console.log(perguntas)
        res.render("index", {
            perguntas: perguntas,
            menssagem: menssagem
        });
        menssagem = false; // Reset the message after rendering
    });
});

app.get("/perguntar", (req, res)=>{
    title = "Perguntar"
    res.render("perguntar")
})

app.post("/salvarpergunta", (req, res)=>{
    var titulo = req.body.titulo
    var descricao = req.body.descricao

    Pergunta.create({ // inserindo dados no banco de dados
        titulo: titulo,     // salva no titulo do banco de dados o titulo que foi definido pelo variavel
        descricao: descricao
    }).then(()=>{
        res.redirect("/")
    })
})

app.get("/pergunta/:id", (req, res)=>{
    var id = req.params.id
    Pergunta.findOne({
        where: {id: id}

    }).then(pergunta => {
        if(pergunta != undefined){ // pergunta encontrada

            res.render("pergunta", {
                pergunta: pergunta
            })
        }else{ // pergunta não encontrada
            menssagem = true
            res.redirect("/")
        }
    })
})

app.listen(8080, ()=>{
    console.log("app rodando")
})