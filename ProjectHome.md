**Localdatabase** is an Object oriented API supporting [Gears](http://gears.google.com/). It aims to provide a [fluent interface](http://en.wikipedia.org/wiki/Fluent_interface) for more readable code.


## Example ##


```
var schema = {"TABLE_NAME":{id:"integer",col_1:"text",col_2:"text"}};

//drop create local database
var _db = new LocalDB(DB_NAME,schema);
_db.drop_create();
if (_db.isValid(schema)) alert("Database schema is consistent");

var rows = _db.from("TABLE_NAME").where({id:1}).or({col_1:"2"}).list();

//insert rows
_db.insert({id:1,col_1:"1",col_2:"2"},"TABLE_NAME").run();
_db.insert({id:2,col_1:"2",col_2:"2"},"TABLE_NAME").run();

//select from table "TABLE_NAME" and iterate over the result set
_db.from("TABLE_NAME").each(function(object) {
alert('Expected 2 as the result, result was ' + object.col_2);
});

var rows = _db.from("TABLE_NAME").order({col_1:"DESC"}).limit(0,2).list();


row_id_1 =_db.from("TABLE_NAME").where({id:1}).get();

	    
_db.delete("TABLE_NAME").where({id:2}).run();
_db.update("TABLE_NAME",{col_1:"1234567"}).where({col_1:"1"}).run();

```