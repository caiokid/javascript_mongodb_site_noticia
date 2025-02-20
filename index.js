const express = require("express");
const app = express();
const path = require("path");


//Vamos usar o html mais para renderiza-lo precisamos do ejs
app.engine('html', require("ejs").renderFile);
app.set('view engine','html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views',path.join(__dirname, '/pages'));


app.listen(5000,()=>{
    console.log("Rodando");
});



var armazenamento =[{'Carlos':'opa','sobre':'vincius'},{'Carlos':'Aham','sobre':'Franca'}
];


app.get("/deletar/:id",(req,res)=>{


    
    armazenamento = armazenamento.filter((val,index)=>{
        if(index != req.params.id){
            console.log(armazenamento);

           return val;
        }

    });
      
      
    console.log(armazenamento);

    res.redirect("/");
  
});



app.get("/",(req,res)=>{
    res.render("index",{nome:armazenamento});
});

