function(doc) {
  if(doc.type === "item") {
    emit(doc.household, {"name": doc.name, "upc": doc.upc, "rev": doc._rev});
  }
}
