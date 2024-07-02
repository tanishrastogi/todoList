const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));


app.set("view engine" , "ejs");
app.use(express.static("public"));


var date = new Date();

var options = {
    weekday: "long",
    day: "numeric",
    month:"numeric", 
    year:"numeric"
}
var fullDate = date.toLocaleDateString("en-us" , options);

mongoose.set("strictQuery" , false);
mongoose.connect("mongodb+srv://MONGO:8896483413@atlascluster.ofjjvzm.mongodb.net/todoListDB");
const todoListSchema = new mongoose.Schema({
    name:String
})

const blogSchema = new mongoose.Schema({
    title:String,
    content:String
})

const Blog = mongoose.model("blog", blogSchema);

const todoListItem = mongoose.model("listItem" , todoListSchema);

const defaultItems = [];

app.get('/' , function(req,res){

    todoListItem.find(function(err , items){
      
      if(items.length ===0){
          if(err){
              console.log(err);
            }
            else{
                for(let i = 0;i<items.length ; i++){
                    console.log(items[i].name);
                }
            todoListItem.insertMany(defaultItems , ((err)=>console.log(err)));
            res.render("index" , {listTitle : fullDate , newListItem: items});  
        }
      }
      else{
        res.render("index" , {listTitle : fullDate , newListItem: items });
      }
      
        
    })
})




app.post('/' , function(req,res){
    
    var userInput = req.body.newItem;
    const linkName = req.body.list;
    const item = new todoListItem({
        name:userInput
    })
    if(linkName===fullDate){
        item.save();
        res.redirect("/");
    }
    else{
        liItem.findOne({name:linkName} , function(err , foundList){
            foundList.item.push(item);
            foundList.save();
            res.redirect("/lists/"+linkName);
        })
    }
    
    
})

app.post("/delete" , function(req,res){
    const checkedItemID = req.body.checkbox;
    const linkName = req.body.listName;
    if(linkName === fullDate){
        todoListItem.findByIdAndRemove(checkedItemID , function(err){
            if(err){
                console.log("error found");
            }
            else{
                console.log("successfully deleted");
                res.redirect("/");
            }
        })
    }
    else{
        liItem.findOneAndUpdate({name:linkName} , {$pull:{item:{_id:checkedItemID}}} , function(err,foundList){
            if(!err){
                res.redirect("/lists/"+linkName);
            }
        })
    }
    
})

const listSchema = new mongoose.Schema({
    name: String,
    item : [todoListSchema]
})

const liItem = mongoose.model("list" , listSchema);

app.get("/lists/:name" , function(req,res){
    let customListName =  req.params.name;
    customListName = _.capitalize(customListName);
    liItem.findOne({name:customListName} , function(err,foundLists){
        if(!foundLists){
            console.log("Doesn't exists");
            const list = new liItem({
                name: customListName,
                item: defaultItems
            })
            
            list.save();
            res.redirect("/lists/"+customListName);
        }
        else{
            const linkname = "/links/"+req.params.name
            console.log("exists");
            res.render("index" , {listTitle: foundLists.name , newListItem: foundLists.item , linkName:linkname})
        }
    })
})





//                      Project 1 : " blog website "


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

app.get("/blog" ,async function(req,res){
    const posts = await Blog.find({})
    res.render(__dirname+"/views/ejsFiles/home" , {homeContent : homeStartingContent , posts : posts}); 
} )

app.get("/blog/about" , function(req,res){
    res.render(__dirname+"/views/ejsFiles/about" , {homeContent :aboutContent }); 
})  

app.get("/blog/contact" , function(req,res){
    res.render(__dirname+"/views/ejsFiles/contact" , {homeContent :contactContent }); 
})

app.get("/blog/compose" , function(req,res){
    res.render(__dirname+"/views/ejsFiles/compose");
})

app.post("/blog/compose" ,async function(req,res){

    var post = {
        title: req.body.postTitle,
        content: req.body.postBody
    }

    const blog = new Blog({
        title: req.body.postTitle,
        content: req.body.postBody
    })

    await blog.save();
    res.redirect("/blog");
})

app.get("/blog/posts/:name" , async function(req,res){
    // console.log(req.params.name);
    const requiredTitle = req.params.name;
    // requiredTitle =  _.lowerCase(requiredTitle);
    console.log(requiredTitle);
    const posts = await Blog.find({});
    posts.forEach(function(post){
        let storedTitle = post.title;
        storedTitle = _.lowerCase(storedTitle);
        if(requiredTitle == storedTitle){
            let storedContent = post.content;
            res.render("ejsFiles/about" , {homeContent :aboutContent});
            
        }
        else{
            console.log("not found" , requiredTitle , storedTitle);
        }

    })

    })

app.listen(process.env.PORT || 3000 , function(){
    console.log("server is up and running");
})    
