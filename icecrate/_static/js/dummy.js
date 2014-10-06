'use strict';

var IcecrateDB = angular.module('icecrate.db', []);

IcecrateDB.service('KeyGenerator', function ($q, $http) {
  this.uuid = function () {
    var deferred = $q.defer();

    var req = $http.get("/_uuids", {'cache': false});
    req.success(function (data) {
      deferred.resolve(data.uuids[0]);
    });
    req.error(function (statusText) {
      deferred.reject(statusText)
    });

    return deferred.promise;
  };
});

IcecrateDB.service('IcecrateDB', function ($window, $q, KeyGenerator) {
  var indexeddb = $window.indexedDB;
  var db = null;
  var lastIndex = 0;

  this.open = function () {
    var deferred = $q.defer();
    var version = 1;
    var request = indexedDB.open('icecrate.db', version);

    request.onupgradeneeded = function (e) {
      db = e.target.result;
      e.target.transaction.onerror = indexedDB.onerror;

      // clear object stores
      // these stores are repopulated from the server, and won't be
      // edited while offline, so no data is lost.
      if (db.objectStoreNames.contains('items')) {
        db.deleteObjectStore('items');
      }
      if (db.objectStoreNames.contains('households')) {
        db.deleteObjectStore('households');
      }
      if (db.objectStoreNames.contains('shopping')) {
        db.deleteObjectStore('shopping');
      }

      // create database
      var itemdb = db.createObjectStore('items', {'keyPath': "_id"});
      itemdb.createIndex('upc', 'upc', {'unique': false});
      itemdb.createIndex('household', 'household', {'unique': false});
      itemdb.createIndex('household,upc', ['household', 'upc'], {'unique': true});

      var householddb = db.createObjectStore('households', {"keyPath": "_id"});

      var shoppingdb = db.createObjectStore('shopping', {"keyPath": "_id"});
      shoppingdb.createIndex('household', 'household', {"unique": false});
    };

    request.onsuccess = function (e) {
      db = e.target.result;
      deferred.resolve(e.target.result);
    };

    request.onerror = function (e) {
      console.log("failure...");
      deferred.reject();
    };

    return deferred.promise;
  };

  // Items
  this.all_items = function () {
    var deferred = $q.defer();

    if (db === null) {
      deferred.reject(
        "(IndexedDB.all_items) "+
        "`icecrate.db` is not open.");
    } else {
      var transaction = db.transaction(['items'], 'readonly');
      var store = transaction.objectStore('items');

      var results = []
      var all = store.openCursor();
      all.onsuccess = function (e) {
        var cursor = e.target.result;

        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          deferred.resolve(results);
        }
      };
      all.onerror = function (e) {
        deferred.reject(e.value);
      }
    }

    return deferred.promise;
  };

  this.get_item_by_id = function (_id) {
    var deferred = $q.defer();

    if (db === null) {
      deferred.reject("(IcecrateDB.get_item_by_id) `icecrate.db` is not open.");
    } else if (_id === undefined) {
      deferred.reject("(IcecrateDB.get_item_by_id) Expected `_id`, got nothing.");
    } else {
      var transaction = db.transaction(['items'], 'readonly');
      var store = transaction.objectStore('items');

      var req = store.get(_id).onsuccess = function (e) {
        deferred.resolve(e.target.result);
      };
    }

    return deferred.promise;
  };

  this.get_items_by_household = function (household_id) {
    var deferred = $q.defer();

    if (db === null) {
      deferred.reject(
        "(IndexedDB.get_items_by_household) "+
        "`icecrate.db` is not open.");
    } else if (household_id === undefined) {
      deferred.reject(
        "(IndexedDB.get_items_by_household) "+
        "Expected `household_id`, got nothing.");
    } else {
      var transaction = db.transaction(['items'], 'readonly');
      var store = transaction.objectStore('items');

      var results = [];
      var req = store.index('household').openCursor(household_id);
      req.onsuccess = function (e) {
        var cursor = e.target.result;

        if(cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          deferred.resolve(results);
        }
      };
      req.onerror = function (e) {
        deferred.reject(e.value);
      };
    }

    return deferred.promise;
  };

  this.get_items_by_upc = function (upc) {
    var deferred = $q.defer();

    if (db === null) {
      deferred.reject(
        "(IndexedDB.get_items_by_upc) "+
        "`icecrate.db` is not open.");
    }
    if (upc === undefined) {
      deferred.reject(
        "(IndexedDB.get_items_by_upc) "+
        "Expected `upc`, got nothing.");
    } else {
      var transaction = db.transaction(['items'], 'readonly');
      var store = transaction.objectStore('items');

      var results = [];
      var req = store.index('household').openCursor(upc);
      req.onsuccess = function (e) {
        var cursor = e.target.result;

        if(cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          deferred.resolve(results);
        }
      };
      req.onerror = function (e) {
        deferred.reject(e.value);
      };
    }

    return deferred.promise;
  };

  this.get_item_by_household_and_upc = function (household_id, upc) {
    var deferred = $q.defer();

    if (db === null) {
      deferred.reject(
        "(IndexedDB.get_item_by_household_and_upc) "+
        "`icecrate.db` is not open.");
    }
    if (upc === undefined || household_id === undefined) {
      deferred.reject(
        "(IndexedDB.get_item_by_household_and_upc) "+
        "Expected `upc` and `household_id`, but at least one is missing.");
    } else {
      var transaction = db.transaction(['items'], 'readonly');
      var store = transaction.objectStore('items');
      var index = store.index('household,upc');

      var req = index.get([household_id, upc]);
      req.onsuccess = function (e) {
        deferred.resolve(e.target.result);
      };
      req.onerror = function (e) {
        deferred.reject(e.value);
      };
    }

    return deferred.promise;
  };

  this.update_item = function (itemdata) {
    var deferred = $q.defer();

    if (db === null) {
      deferred.reject("(IndexedDB.update_item) `icecrate.db` is not open yet.");
    } else if (itemdata === undefined) {
      deferred.reject("(IndexedDB.update_item) Expected item data, got nothing.");
    } else {
      var transaction = db.transaction(['items'], 'readwrite');
      var store = transaction.objectStore('items');

      // might need to wait for UUID before insertion, so either wrap
      // the existing id in a promise, or wait for the key generator.
      console.log(itemdata);
      var _id = $q.when(itemdata._id || KeyGenerator.uuid());
      _id.then(
        function (data) {
          itemdata._id = data;
      }).then(
        function () {
        var req = store.put(itemdata);
        req.onsuccess = function (e) {
          deferred.resolve();
        };
        req.onerror = function (e) {
          deferred.reject(e.value);
        };
      });
    }

    return deferred.promise;
  };

  // Households
  this.all_households = function () {
    var deferred = $q.defer();

    if (db === null) {
      deferred.reject(
        "(IndexedDB.all_households) "+
        "`icecrate.db` is not open.");
    } else {
      var transaction = db.transaction(['households'], 'readonly');
      var store = transaction.objectStore('households');

      var results = []
      var all = store.openCursor();
      all.onsuccess = function (e) {
        var cursor = e.target.result;

        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          deferred.resolve(results);
        }
      };
      all.onerror = function (e) {
        deferred.reject(e.value);
      }
    }

    return deferred.promise;
  };

  this.get_household_by_id = function (_id) {
    var deferred = $q.defer();

    if (db === null) {
      deferred.reject("(IcecrateDB.get_households_by_id) `icecrate.db` is not open.");
    } else if (_id === undefined) {
      deferred.reject("(IcecrateDB.get_households_by_id) Expected `_id`, got nothing.");
    } else {
      var transaction = db.transaction(['households'], 'readonly');
      var store = transaction.objectStore('households');

      var req = store.get(_id).onsuccess = function (e) {
        deferred.resolve(e.target.result);
      };
    }

    return deferred.promise;
  };

  this.update_household = function (householddata) {
    var deferred = $q.defer();

    if (db === null) {
      deferred.reject("(IndexedDB.update_household) `icecrate.db` is not open yet.");
    } else if (householddata === undefined) {
      deferred.reject("(IndexedDB.update_household) Expected household data, got nothing.");
    } else {
      var transaction = db.transaction(['households'], 'readwrite');
      var store = transaction.objectStore('households');

      var _id = $q.when(householddata._id || KeyGenerator.uuid());
      _id.then(
        function (data) {
          householddata._id = data;
      }).then(
        function () {
        var req = store.put(householddata);
        req.onsuccess = function (e) {
          deferred.resolve();
        };
        req.onerror = function (e) {
          deferred.reject(e.value);
        };
      });
    }

    return deferred.promise;
  };

  // Shopping Lists
  this.all_shopping_lists = function () {
    var deferred = $q.defer();

    if (db === null) {
      deferred.reject(
        "(IndexedDB.all_shopping_lists) "+
        "`icecrate.db` is not open.");
    } else {
      var transaction = db.transaction(['shopping'], 'readonly');
      var store = transaction.objectStore('shopping');

      var results = [];
      var req = store.openCursor();
      req.onsuccess = function (e) {
        var cursor = e.target.result;

        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          deferred.resolve(results);
        }
      };
      req.onerror = function (e) {
        deferred.reject(e.value);
      };
    }

    return deferred.promise;
  };

  this.get_shopping_lists_by_household = function (household_id) {
    var deferred = $q.defer();

    if (db === null) {
      deferred.reject(
        "(IndexedDB.get_shopping_lists_by_household) "+
        "`icecrate.db` is not open.");
    } else if (household_id === undefined) {
      deferred.reject(
        "(IndexedDB.get_shopping_lists_by_household) "+
        "Expected `household_id`, got nothing.");
    } else {
      var transaction = db.transaction(['shopping'], 'readonly');
      var store = transaction.objectStore('shopping');

      var results = [];
      var req = store.index('household').openCursor(household_id);
      req.onsuccess = function (e) {
        var cursor = e.target.result;

        if(cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          deferred.resolve(results);
        }
      };
      req.onerror = function (e) {
        deferred.reject(e.value);
      };
    }

    return deferred.promise;
  };

  this.get_shopping_list_by_id = function (_id) {
    var deferred = $q.defer();

    if (db === null) {
      deferred.reject("(IcecrateDB.get_shopping_list_by_id) `icecrate.db` is not open.");
    } else if (_id === undefined) {
      deferred.reject("(IcecrateDB.get_shopping_list_by_id) Expected `_id`, got nothing.");
    } else {
      var transaction = db.transaction(['shopping'], 'readonly');
      var store = transaction.objectStore('shopping');

      var req = store.get(_id).onsuccess = function (e) {
        deferred.resolve(e.target.result);
      };
    }

    return deferred.promise;
  };

  this.update_shopping_list = function (shoppinglistdata) {
    var deferred = $q.defer();

    if (db === null) {
      deferred.reject("(IndexedDB.update_shopping_list) `icecrate.db` is not open yet.");
    } else if (shoppinglistdata === undefined) {
      deferred.reject("(IndexedDB.update_shopping_list) Expected shopping list data, got nothing.");
    } else {
      var transaction = db.transaction(['shopping'], 'readwrite');
      var store = transaction.objectStore('shopping');

      var _id = $q.when(shoppinglistdata._id || KeyGenerator.uuid());
      _id.then(
        function (data) {
        shoppinglistdata._id = data;
      }).then(
        function (data) {
          var req = store.put(shoppinglistdata);
          req.onsuccess = function (e) {
            deferred.resolve(e.value);
          };
          req.onerror = function (e) {
            deferred.reject(e.value);
          };
      });
    }

    return deferred.promise;
  };
});

IcecrateDB.service('IcecrateDBSync', function ($rootScope, $q, $http, IcecrateDB) {
  var households_url    = '/households';
  var shopping_list_url = '/lists';
  var items_url         = '/items';

  this.pull = function () {
    return $q.all(
      this.pull_items(),
      this.pull_households(),
      this.pull_shopping_lists());
  };

  this.pull_items = function () {
    return $http.get(items_url).then(function (data) {
      var items = data.data.items;
      for (var i in items) {
         var item = items[i];
         IcecrateDB.update_item(item);
       }
    });
  };

  this.pull_households = function () {
    return $http.get(households_url).then(function (data) {
      var households = data.data.households;
      for (var i in households) {
        var household = households[i];
        IcecrateDB.update_household(household);
      }
    });
  };

  this.pull_shopping_lists = function () {
    return $http.get(shopping_list_url).then(function (data) {
      var lists = data.data.lists;
      for (var i in lists) {
        var list = lists[i];
        IcecrateDB.update_shopping_list(list);
      }
    });
  };

  this.push = function () {
    return $q.all(
      this.push_items(),
      this.push_households(),
      this.push_shopping_lists());
  };

  this.push_items = function () {
    return IcecrateDB.all_items().then(function (data) {
      $http.post(items_url, {'items': data}).then(function (data) {
        console.log(data);
      });
    });
  };

  this.push_households = function () {
    return IcecrateDB.all_households().then(function (data) {
      $http.post(households_url, {'households': data}).then(function (data) {
        console.log(data);
      });
    });
  };

  this.push_shopping_lists = function () {
    return IcecrateDB.all_shopping_lists().then(function (data) {
      $http.post(shopping_list_url, {'lists': data}).then(function (data) {
        console.log(data);
      });
    });
  };
});

IcecrateDB.service('IcecrateLocal', function ($window, $q) {
  var local = $window.localStorage;

  this.set = function (key, value) {
    return local.setItem(key, value);
  };

  this.get = function (key, value) {
    return local.getItem(key) || value;
  };
});
