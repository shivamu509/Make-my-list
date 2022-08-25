const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require('lodash')
const app = express();

// mongoose.connect("mongodb://localhost:27017/todolistDB",(err)=>{
//   if (err)
//     console.log(err);
//   else
//     console.log("Database Connected");
// })
mongoose.connect("mongodb+srv://shivam:admin123@cluster0.fiuxofp.mongodb.net/todolistDB?retryWrites=true&w=majority",(err)=>{
  if (err)
    console.log(err);
  else
    console.log("Database Connected");
})

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
  name: String
})
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name : "Welcome to your todolist"
})
const item2 = new Item({
  name : "Hit the + button to add a new item"
})
const item3 = new Item({
  name : "<-- Hit this to delete an item"
})
const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model("List",listSchema)

app.get("/", function(req, res) {
  Item.find((err,items)=>{
    if (items.length===0){
      Item.insertMany(defaultItems,(err)=>{
        if(err)
          console.log(err);
        else
          console.log("Items added successfully");
      })
      res.redirect("/")
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  })
});

app.post("/", function(req, res){
  console.log(req.body)
  const listName = req.body.list
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  })

  if(req.body.list=="Today"){
    item.save()
    res.redirect('/')
  }else{
    List.findOne({name: listName}, (err, foundList)=>{
      foundList.items.push(item)
      foundList.save()
    })
    res.redirect("/"+listName)  
  }
});

app.post("/delete",(req,res)=>{
  console.log(req.body)
  const customListName = _.capitalize(req.body.listName)
  const postId = req.body.checkbox
  if(customListName==="Today"){
    console.log("entered in first")
    Item.findByIdAndDelete(postId,(err)=>{
      if(err)
      console.log(err);
      else
      console.log("Items deleted successfully");
    }) 
    res.redirect('/')
  }else{
    console.log("entered in 2nd");
    List.findOneAndUpdate({name: customListName}, {$pull: {items:{_id: postId}}}, (err, foundList)=>{
      if(!err){
        console.log("Items updated");
      }
    })
    res.redirect("/"+customListName)
  }
})

app.get("/:listName", function(req,res){
  customListName = _.capitalize(req.params.listName)
  List.findOne({name: customListName},(err,foundList)=>{
    if (!foundList){
      const list = new List({
        name : customListName,
        items: defaultItems
      })
      list.save()
      res.redirect('/'+customListName)
    }else{
      res.render("list",{listTitle:foundList.name ,newListItems: foundList.items}) 
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
