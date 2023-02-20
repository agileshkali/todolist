const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://agiagilesh143:Savidham386@cluster0.4qtkdb2.mongodb.net/?retryWrites=true&w=majority" , {useNewUrlParser: true});

const itemSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
  name: "Welcome to your Todo List!"
});

const item2 = new Item ({
  name: "Click here to add new iitems"
});

const item3 = new Item ({
  name: "Click here to the items"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: true
  },
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, results){

    if (results.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("the data has been added.")
        }
      }); 
      res.redirect('/');
    } else {
      res.render("list", {listTitle: "Today", newListItems: results});
    }   
  })
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item ({
    name: itemName
  });

  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, listresults){
      listresults.items.push(item);
      listresults.save();
      res.redirect("/"+_.capitalize(listName));
    })
  }
});

app.post("/delete", function(req, res){
  const checkedIdCheckbox = req.body.checkbox;
  const listName = req.body.inputList;

    if (listName === "Today"){
        Item.findByIdAndDelete(checkedIdCheckbox, function(err){
          if (!err) {
            res.redirect('/');
          }
          });
        } else {
          List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:checkedIdCheckbox}}}, function(err, listResults){
            if (!err) {              
              res.redirect('/'+_.capitalize(listName));
            }
          });
        }
      }); 




app.get("/:newPage", function(req, res){
  const customListname = _.capitalize(req.params.newPage);

  List.findOne({name: customListname}, function(err, foundList){
    if (!err){
      if (!foundList) {
        //create a new list
        const list = new List ({
          name: customListname,
          items: defaultItems
        });
        
      list.save();
      res.redirect("/"+customListname);
      } else {
        res.render("list", {listTitle: _.capitalize(foundList.name), newListItems: foundList.items});
      }
    }
  });
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
