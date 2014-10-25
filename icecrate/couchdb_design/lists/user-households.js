function (head, req) {
  provides("json", function () {
    var member_of = [];
    var guest_of  = [];
    var row;

    while(row = getRow()) {
      if(row.value.status === "member") {
        member_of.push(row.id);
      }
      if(row.value.status === "guest") {
        guest_of.push(row.id);
      }
    }

    send(toJSON({
      "key": req.query.key,
      "type": "participating-in",
      "member": member_of,
      "guest": guest_of,
    }));
  });
}
