function(doc) {
  if(doc.type === "household") {
    for(var m in doc.members) {
      emit(doc.members[m], {"status": "member", "rev": doc._rev});
    }
    for(var g in doc.guests) {
      emit(doc.guests[g], {"status": "guest", "rev": doc._rev})
    }
  }
}
