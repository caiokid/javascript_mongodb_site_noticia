const express = require('express');
var bodyParser = require('body-parser')
const mongoose = require('mongoose');
const fileupload = require('express-fileupload');
const app = express();
const fs = require('fs')
var session = require('express-session');
const Posts = require('./Posts.js');
const fileUpload = require('express-fileupload');
const path = require('path');

const Users = require('./Users.js');



mongoose.connect('mongodb://localhost:27017/caio').then(function(){
  console.log('Conectou');
}).catch((err)=>{
   console.log(err.message);
})
 

app.use(session({secret: 'éosguri', cookie:{maxAge:60000}}))
app.use(bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended:true
}));

app.use(fileUpload({
  useTempFiles:true,
  tempFileDir:path.join(__dirname,'temp')
}))

//Vamos usar o html mais para renderiza-lo precisamos do ejs
app.engine('html', require('ejs').renderFile);
app.set('view engine','html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views',path.join(__dirname, '/pages'));


app.get('/',(req,res)=>{

  if(req.query.busca == null){
    Posts.find({}).sort({'_id': -1}).limit(3).exec(function(err,posts){

      posts = posts.map((val)=>{
        return { 
          titulo:val.titulo,
          conteudo:val.conteudo,
          descricaoCurta: val.conteudo.substr(0,100),
          imagem:val.imagem,
          slug:val.slug,
          categoria:val.categoria,
          views: val.views
          
        }
      });
    
      Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){

        postsTop = postsTop.map(function(val){

          return {

            titulo: val.titulo,

            conteudo: val.conteudo,

            descricaoCurta: val.conteudo.substr(0,100),

            imagem: val.imagem,

            slug: val.slug,

            categoria: val.categoria,

            views: val.views

          }

        })

         Posts.findOneAndUpdate({slug: req.params.slug}, {$inc : {views: 1}}, {new: true},function(err,resposta){

         res.render('home',{posts:posts,postsTop:postsTop});

        })
     })

    });

  }else{

    Posts.find({titulo: {$regex: req.query.busca,$options:"i"}},function(err,posts){
      posts = posts.map(function(val){
        return {
        titulo: val.titulo,
        conteudo: val.conteudo,
        descricaoCurta: val.conteudo.substr(0,100),
        imagem: val.imagem,
        slug: val.slug,
        categoria: val.categoria,
        views: val.views
                
        }
      })
      res.render('busca',{posts:posts,contagem:posts.length});
    })
}
});






app.get('/:slug',(req,res)=>{
 // (req.params.slug);

 Posts.findOneAndUpdate({slug: req.params.slug}, {$inc : {views: 1}}, {new: true},function(err,resposta){
  //console.log(resposta);
 
  if(resposta != null){

    Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){

      // console.log(posts[0]);
    
      postsTop = postsTop.map(function(val){
    
        return {
    
          titulo: val.titulo,
    
          conteudo: val.conteudo,
    
          descricaoCurta: val.conteudo.substr(0,100),
    
          imagem: val.imagem,
    
          slug: val.slug,
    
          categoria: val.categoria,
    
          views: val.views
    
        }
      })
       
      res.render('single',{noticia:resposta,postsTop:postsTop});
    })
  }else{

    res.redirect('/');

  }
})
});

app.post('/admin/login',(req,res)=>{
  Users.find({usuario:req.body.login,senha:req.body.senha}).exec((err,usua)=>{
    
    if(usua == 0){
       
    res.redirect('/admin/login');

    }else{
        
      req.session.login = req.body.login;
      console.log( req.body.login)
      console.log('Funcionou');
       
      res.redirect('/admin/login');

  }

})
})
  



app.post('/admin/cadastro',(req,res)=>{
  //Banco de dados

  //Upload de arquivos dentro da variável req.files.

  let formato = req.files.arquivo.name.split('.');


  var imagem = "";


  if(formato[formato.length - 1] == "jpg"){


    imagem = new Date().getTime()+'.jpg';


    req.files.arquivo.mv(__dirname+'/public/images/'+imagem);

  }else{


    fs.unlinkSync(req.files.arquivo.tempFilePath);


  }

  console.log(req.files);
   
  Posts.create({


  titulo:req.body.titulo,


  imagem: 'http://localhost:5000/public/images/'+imagem,


  categoria: 'Nenhuma',


  conteudo: req.body.conteudo,


  slug: req.body.slug,


  autor: "Admin",


  views: 0

});

res.redirect('/admin/login')

})



app.get('/admin/login',(req,res)=>{


  if(req.session.login == null){

    res.render('admin-login');

  }else{ 
    Posts.find({}).sort({'views': -1}).exec(function(err,postsTop){
    
      postsTop = postsTop.map(function(val){
    
        return {
          id:val._id,
          titulo: val.titulo,
    
          conteudo: val.conteudo,
    
          descricaoCurta: val.conteudo.substr(0,100),
    
          imagem: val.imagem,
    
          slug: val.slug,
    
          categoria: val.categoria,
    
          views: val.views
    
        }
      })
       
      res.render('admin-panel',{postsTop:postsTop});
    })
  }
}
)




app.get('/admin/deletar/:id', (req,res)=>{
  Posts.deleteOne({_id:req.params.id}).then(function(){


  res.redirect('/admin/login')


});
})


app.listen(5000,()=>{
  console.log('Rodando');
});
