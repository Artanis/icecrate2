function (head, req) {
  provides("json", function () {
    var items = [];
    var row;

    while(row = getRow()) {
      items.push(row.id);
    }

    send(toJSON({
      "type": "house_items",
      "key": req.key,
      "items": items
    }));
  });
}
