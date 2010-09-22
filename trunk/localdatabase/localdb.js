/* Simple JavaScript DB layer supporting Google Gears DB
 * Sets up google.gears.*, which is *the only* supported way to access Gears.
 * By Gregory Desvaux
 * Apache License 2.0 Licensed.
 */
function Stmt ( db, sql, args)
{
	this.db = db;
	this.sql = sql===undefined? "" : sql;
	this.args = args===undefined ? [] : args;
}
Stmt.prototype.append=function(sql,args) {
	this.sql = sql===undefined ? this.sql : this.sql+sql;
	this.args = args===undefined ? this.args : this.args.concat(args);
	return this;
}
Stmt.prototype.val=function(m) {
	var v=[];
	for (var fn in m) {
		v.push(m[fn]);
	}
	return v;
}
Stmt.prototype.expr_where=function(m) {
	var terms = [];
	for (var fn in m) {
		terms.push(fn + ' = ? ');					
	}
	return terms.length>0 ? ' where ' + terms.join( ' and ' ) : '';
}
Stmt.prototype.expr_order=function(m) {
	var terms = [];
	for (var fn in m) {
		terms.push(fn + " " + m[fn]);					
	}
	return terms.length>0 ? ' order by ' + terms.join( ',  ' ) : '';
}
Stmt.prototype.insert=function(table_name,m) {
	var col = [], val = [];
	for (var fn in m) {
		col.push(fn);
		val.push("?");
		this.args.push(m[fn]);
	}
	this.sql = "insert into "+table_name+ " (" + col.join(', ') + ") values (" + val.join(", ") + ")";
	return this;
}
Stmt.prototype.update=function(table_name,v){
	var set = [];			
	for (var fn in v) {
		set.push(fn+'=?');
		this.args.push(v[fn]);
	}
	this.sql = 'update ' + table_name + ' set ' + set.join(', ');
	return this;
}
Stmt.prototype.delete=function(table_name){
	this.sql = "delete from "+table_name;
	return this;
}
Stmt.prototype.from=function(table_name) {
	this.sql = "select * from " + table_name;
	return this;
}
Stmt.prototype.where=function(m) {
	return this.append(this.expr_where(m),this.val(m));
}
Stmt.prototype.order=function(m) {
	return this.append(this.expr_order(m));
}
Stmt.prototype.list=function() {
	var elts = [];
	var rs = this.db.execute(this.sql,this.args);
	while (rs && rs.isValidRow()) {
	  var elt = {};
	  for (var i=0;i<rs.fieldCount();i++)
	  {					
		elt[rs.fieldName(i).toLowerCase()]=rs.field(i);
	  }
	  elts.push(elt);
	  rs.next();	
	}
	rs.close();
	return elts;
}
Stmt.prototype.each=function(fn) {
	var list = this.list();
	for(i=0;i< list.length;i++) {fn(list[i])}
}
Stmt.prototype.get=function(def) {
 	var rs = this.list();
	return rs.length>0 ? rs[0] : def===undefined? {} : def;
}
Stmt.prototype.run=function() {
	this.db.execute(this.sql,this.args);
}
LocalDB.prototype.log = function(message)
{
	if (window.console && window.console.log)
	{
	   window.console.log(message);
	}
}
LocalDB.prototype.getDB = function(name) {
  this.log("DB Name: " + name);
  try {
    var db = google.gears.factory.create('beta.database', '1.0');
    db.open(name);
    return db;
  } catch (e) {
    this.log('Could not get a handle to the database [' + name + ']: '+ e.message);
  }
}
function LocalDB(name,schema) {
  this.db = this.getDB(name);
  this.schema= (schema===undefined)?{}:schema;
}
LocalDB.prototype.remove_db= function() {
	try {
		this.db.open(DB_NAME);
		this.db.remove();
	}
	catch (e) {
	}
}
LocalDB.prototype.execute = function(sql, args) {
  try {
    var argvalue = '';
    if (args) argvalue = " with args: " + args.join(', ');
    this.log("SQL statement: " + sql + argvalue);
    
    return this.db.execute(sql, args);
  } catch (e) {
    var argvalue = '';
    if (args) argvalue = " with args: " + args.join(', ');
    this.log("LocalDB operation: could not execute query '" + sql + argvalue + "'. Caught exception: " + e.message);
  }
}
LocalDB.prototype.drop_create=function(schema) {
  			this.schema= (schema===undefined)?(this.schema===undefined)?{}:this.schema:schema;
			for (var table in this.schema) {
				var drop = "drop table if exists "+table;
				var col = [];
				for (var column in this.schema[table]) {
					col.push(column + " " + this.schema[table][column]);
				}
				var create = "create table if not exists "+table+" (" + col.join(", ") + ")";
				this.execute(drop);
				this.execute(create);
			}								
		}
LocalDB.prototype.isValid=function(schema) {
			var schema= (schema===undefined)?this.schema:schema ;
			var rs = true;
			var tables = this.from("sqlite_master").where({"type":"table"}).list();
			for (var t in schema) {
				var is_t = false;
				for (var i in tables) {
					if (tables[i].name==t) is_t=true;
				}
				rs= rs && is_t;					
			}								
			return rs;
		}
LocalDB.prototype.from=function(table_name) {
			return new Stmt(this).from(table_name);
}
LocalDB.prototype.stmt=function(sql,args) {
			return new Stmt(this,sql,args);
}
LocalDB.prototype.insert=function(m,table_name) {
			return new Stmt(this).insert(table_name,m);
		}
LocalDB.prototype.update=function(table_name,m) {
			return new Stmt(this).update(table_name,m);
		}		
LocalDB.prototype.delete=function(table_name) {
			return new Stmt(this).delete(table_name);
		}
