const express = require('express');
const app = express();
const db = require('./config/mongoose');
const Users = require('./model/users');
const Files = require('./model/files')
const passport = require('passport');
const passport_local  = require('./config/passport');
const cors = require('cors');
const session = require('express-session');
const multer = require('multer');
const LocalPassport = require('./config/passport');
const mongoStore = require('connect-mongo')(session);

const cookieParser = require('cookie-parser');




app.use(express.urlencoded());
app.use(cookieParser());
app.use(express.static('./assets'));


app.set('view engine' , 'ejs');
app.set('views' , './view');

app.use(session({
    name : 'basiclogin' ,
    secret: 'blahsomething',
    saveUninitialized :false,
    resave: false,
    store: new mongoStore({
        mongooseConnection:db,
        autoRemove:'disabled'
    }, function(err){
        console.log('error in mongo store' , err);
    })
}));


app.use('/uploads' , express.static(__dirname + '/uploads'))


app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);
app.use(cors());

app.get('/'  , function(req , res){
    return res.render('signin');
});

app.get('/signup' ,  function(req , res){
    return res.render('signup');
})


app.post('/create-account' , async function(req , res){

    // console.log(req.body)
  
            let user = Users.findOne({username:req.body.username});
            if(!user){
                // creating the users data
                res.redirect('back');        
            } else{
                //if user exists
               
                let newUser = await Users.create({
                    username :  req.body.username.toLowerCase(),
                    password : req.body.password,
                    name : req.body.name
                });
                console.log('$$$$$$$',newUser)
                res.redirect('/');
    } 
})


app.get('/home' , passport.checkAuthentication ,async (req , res)=>{
    let files = await Files.find({uploadedBy : req.user.id});
    console.log(files)

    return res.render('home' , {
        file : files
    });
});


app.post('/create-session' ,passport.authenticate(
    'local',
    {failureRedirect:'/'}
) , function(req , res){
    return res.redirect('/home');
});


app.get('/logout' , function(req , res){
    req.logout();
    res.redirect('/');
})


// app.post('/save-file' ,async function(req , res){
//     if(!req.isAuthenticated()){
//         return res.redirect('/');
//     } else{
//         let user = await Users.findOne({username : req.user.username});
//         if(user){
//             Users.uploadFile(req, res , function(err){
//                 if(err){
//                     return console.log('multer ' , err)
//                 }
//                user.name = req.user.name;
//                user.username = req.user.username;

//                if(req.file){
//                    user.file = Users.filePath + '/' + req.file.filename;
//                }
//                user.save();
//                return res.redirect('back');
//             })

//         }else{
//             res.redirect('/');
//         }
//     }
// });


const storage = multer.diskStorage({
    destination: function(req,file , cb){
        cb(null , 'uploads2/')
    },
    filename: function(req  ,file ,cb ){
        cb(null , file.fieldname + '-'+ Date.now())
    }
})

var upload = multer({
    storage:storage
});



app.post('/save-file' , upload.single('myfile') ,async (req , res , next)=>{
    const file = req.file;
    if(!file){
        res.send('error please upload a file');
        return;
    }

    let newFile =await Files.create({
        name : file.originalname,
        uploadedBy: req.user.id,
        path: file.path
    });
    
    res.redirect('back');
});




app.listen(3000 , ()=>{
    console.log("running successfully");
})