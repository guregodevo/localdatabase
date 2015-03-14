## Developer 's guide ##

### Schema update ###

```
 localdb.drop_create(yourschema_map);
```

### Object update ###

```
  var person = localdb.from("PERSON").where({id:123}).get();
  person.name = "Gregory";
  localdb.update("PERSON",person).where({id:123}).run();
  // person name is updated.
```

### Unit-test ###

Localdatabase test suites are available on [unit-test.html](http://code.google.com/p/localdatabase/source/browse/trunk/localdatabase/unit-test.html) . We use QUnit as a unit testing framework.