angular.module('ambersive.popup').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/views/popup.area.html',
    "<div id=popup_area ng-controller=\"PopupAreaCtrl as popupArea\" compile=popupArea.popup class=\"modal fade\" ng-class=popupArea.getCss() ng-style=popupArea.getStyle()></div>"
  );


  $templateCache.put('src/views/popup.modal.footer.html',
    "<button type=button class=\"btn btn-default\" ng-click=close($event)>{{text.close}}</button> <button type=button class=\"btn btn-primary\" ng-click=submit($event)>{{text.submit}}</button>"
  );


  $templateCache.put('src/views/popup.modal.html',
    "<div class=modal-dialog ng-class=getCss()><div class=modal-content><div class=modal-header><button type=button class=close ng-click=close($event) aria-label=Close><span aria-hidden=true>&times;</span></button><h4 class=modal-title>{{ data.headline }}</h4></div><div class=modal-body compile=data.main></div><div class=modal-footer compile=data.footer ng-if=\"data.footer !== undefined\"></div></div></div>"
  );

}]);
