function resolve(url, base_url) {
  // https://stackoverflow.com/a/12965135/152313
  var doc      = document
    , old_base = doc.getElementsByTagName('base')[0]
    , old_href = old_base && old_base.href
    , doc_head = doc.head || doc.getElementsByTagName('head')[0]
    , our_base = old_base || doc_head.appendChild(doc.createElement('base'))
    , resolver = doc.createElement('a')
    , resolved_url
    ;

  our_base.href = base_url;
  resolver.href = url;
  resolved_url  = resolver.href; // browser magic at work here

  if (old_base) old_base.href = old_href;
  else doc_head.removeChild(our_base);
  return resolved_url;
}

var ZXing = angular.module("ZXing", []);

ZXing.config(function ($compileProvider) {
  // Update sanitization to allow zxing links.
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|zxing):/)
});

ZXing.controller('ScanReturn', function ($scope, $location) {
  // # %23
  // { %7B
  // } %7D
  $scope.scanreturn = resolve("%23/items?upc=%7BCODE%7D", "");
});

ZXing.directive('zxingScanlink', function () {
  return {
    'controller': "ScanReturn",
    'template': "<a href=\"zxing://scan/?ret={{ scanreturn }}\"><span class=\"glyphicon glyphicon-barcode\"></span> Scan an item</a>"
  };
});

// $(document).ready(function() {
//     // Transform all zxing-class links into zxing callbacks
//     $(".zxing").each(function(index) {
//         var path = encodeURIComponent(decodeURIComponent(this.href));
//         this.href = "zxing://scan/?ret={0}".format(path);
//
//     })
// });
