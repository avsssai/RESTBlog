var express = require('express'),
    bodyParser = require('body-parser');
    mongoose = require('mongoose'),
    methodOverride = require('method-override'),
    sanitizer = require('express-sanitizer');


var app = express();

//override with post having ?_method=PUT/DELETE
app.use(methodOverride("_method"));

var PORT = 3500;
//APP CONFIG
app.set('view engine','ejs');

app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/RESTBlog",{useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:false},(err)=>{
    if(err){
        console.log({success:false,errorDesc:"Could not connect to the database.",error:error});
    }else{
        console.log({success:true,message:"connected to the database."});
    }
})


//what do we need in the blog schema,
//1. title
//2. imageURL
//3. body
//4. date

var blogSchema = mongoose.Schema({
    title:String,
    imageUrl:String,
    body:String,
    created:{type:Date,default:Date.now}
})

var Blog = mongoose.model("Blog",blogSchema);

app.use(bodyParser.urlencoded({extended:true}));
app.use(sanitizer());

app.use(express.static("public"));

// Blog.create({
//     title:"First Blog",
//     imageUrl:"https://picsum.photos/200",
//     body:"A sample body for my first blog."
// })

//RESTful ROUTES.

app.get('/',(req,res)=>{
    res.redirect('/blogs');
})
//INDEX ROUTE
app.get('/blogs',(req,res)=>{
    Blog.find({},(err,blogs)=>{
        if(err){
            console.log({
                success:false,
                message:"error in fetching the blogs from DB.",
                error:err
            })
        }else{
            res.render('index',{blogs:blogs});
        }
    })
})

//NEW ROUTE
app.get('/blogs/new',(req,res)=>{
    res.render('new');
})

//CREATE ROUTE.
//and redirect back to home.

app.post('/blogs',(req,res)=>{
    //use the data in the req.body

    //since we passed everything inside a blog in the form,
    //it autoatically creates a new object called blog.

    //model.create method.
     req.body.blogs.body = req.sanitize(req.body.blogs.body);


    Blog.create(req.body.blogs,(error,newBlog)=>{
        if(error){
            console.log({success:false,errorDesc:"Could not create a new Blog.",error:error});
            res.render('new');
        }else{
            console.log({success:true,message:"Created new Blog.",newBlog:newBlog});
            res.redirect('/blogs');
        }
    })
})

//SHOW
app.get('/blogs/:id',(req,res)=>{
    var id = req.params.id;
    Blog.findById(id,(error,blog)=>{
        if(error){
            console.log(error);
        }else{
            res.render('show',{blog:blog});
        }
    })
})

//EDIT ROUTE. /blogs/:id/edit
app.get('/blogs/:id/edit',(req,res)=>{
    var id = req.params.id;
    var blogToEdit = Blog.findById(id,(err,foundBlog)=>{
        if(err){
            console.log(err);
            res.redirect('/blogs');
        }else{
            res.render('edit',{blog:foundBlog})
        }
    })
})

app.put('/blogs/:id',(req,res)=>{
    var id = req.params.id;
    req.body.blog.body = req.sanitize(req.body.blog.body);

    console.log(req.body);
    // findByIdandUpdate(id,updatedInfo,callback)
    Blog.findByIdAndUpdate(id,req.body.blog,(error,updatedBlog)=>{
        if(error){
            console.log(error);
            res.redirect('/');
        }else{
            res.redirect(`/blogs/${id}`);
        }
    })
})

app.delete('/blogs/:id',(req,res)=>{
    var id = req.params.id;
    Blog.findByIdAndRemove(id,(err,deletedOne)=>{
        if(err){
        console.log(err);
        res.redirect('/blogs');
        }else{
            console.log(`Deleted one ${deletedOne.title}.`);
            res.redirect('/blogs');
        }
    })
})

app.listen(PORT,()=>{
    console.log("Blog Server started on PORT " + PORT);
})