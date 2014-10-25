function(doc) {
  if(doc.type === "shopping-list") {
    emit(doc.household, {"rev": doc._rev, "name": doc.name})
  }
}
