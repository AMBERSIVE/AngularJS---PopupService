/**
 * Popup/Modal Service for AngularJS
 * @version v0.0.1
 * @link http://www.ambersive.com
 * @licence MIT License, http://www.opensource.org/licenses/MIT
 */

(function(window, document, undefined) {

    'use strict';

    angular.module('ambersive.popup',['ambersive.helper']);

    angular.module('ambersive.popup').config([
        function () {

        }
    ]);

    angular.module('ambersive.popup').provider('popupSettings',[
        function(){

            // Modal

            var modalTemplateUrl = 'src/views/popup.modal.html',
                setModalTemplateUrl = function(path){
                    if(path === undefined){
                        return;
                    }
                    modalTemplateUrl = path;
                    return modalTemplateUrl;
                };

            // Modal Footer

            var modalFooterTemplateUrl = 'src/views/popup.modal.footer.html',
                setModalFooterTemplateUrl = function(path){
                    if(path === undefined){
                        return;
                    }
                    modalFooterTemplateUrl = path;
                    return modalFooterTemplateUrl;
                };

            // Modal Area

            var modalAreaTemplateUrl = 'src/views/popup.area.html',
                setModalAreaTemplateUrl = function(path){
                    if(path === undefined){
                        return;
                    }
                    modalAreaTemplateUrl = path;
                    return modalAreaTemplateUrl;
                };

            // Modal Standard Texts

            var modalTextClose = 'Close',
                modalTextSubmit = 'OK',
                setModalTextClose = function(value){
                    if(value !== undefined){
                        modalTextClose = value;
                    }
                    return modalTextClose;
                },
                setModalTextSubmit = function(value){
                    if(value !== undefined){
                        modalTextSubmit = value;
                    }
                    return modalTextSubmit;
                };

            return {
                setModalTemplateUrl:setModalTemplateUrl,
                setModalAreaTemplateUrl:setModalAreaTemplateUrl,
                setModalFooterTemplateUrl:setModalFooterTemplateUrl,
                setModalTextClose:setModalTextClose,
                setModalTextSubmit:setModalTextSubmit,
                $get: function () {
                    return {
                        modalTemplateUrl:modalTemplateUrl,
                        modalAreaTemplateUrl:modalAreaTemplateUrl,
                        modalFooterTemplateUrl:modalFooterTemplateUrl,
                        modalTextClose:modalTextClose,
                        modalTextSubmit:modalTextSubmit
                    };
                }
            };

        }
    ]);

    angular.module('ambersive.popup').factory('PopupSrv',['$q','HelperSrv','$rootScope','$log','$timeout',
        function($q,HelperSrv,$rootScope,$log,$timeout){

            var PopupSrv = {},
                Popups = [];

            PopupSrv.amount = function(){
              return Popups.length;
            };

            PopupSrv.load = function(){
                $rootScope.$broadcast('checkPopup',{});
            };

            PopupSrv.open = function(options){
                var deferred = $q.defer();

                options.name = options.name+HelperSrv.generator.string(10);

                PopupSrv.setPopup(options);
                PopupSrv.load();

                $rootScope.$on('loadedPopup'+options.name.toUpperCase(), function(event,args) {
                    deferred.resolve({'unique':options.name.toUpperCase(),'close':PopupSrv.close});
                });

                return deferred.promise;
            };

            PopupSrv.close = function(){
                $rootScope.$broadcast('closePopup', {});
            };

            PopupSrv.removePopup = function(index){
                if(index === undefined){
                    Popups.shift();
                }
            };

            PopupSrv.setPopup = function(data){
                Popups.push(data);
            };


            $rootScope.$on('checkPopup', function(event,args) {
                if(Popups.length > 0){
                    $rootScope.$broadcast('loadPopup', Popups[0]);
                }
            });

            return PopupSrv;

        }
    ]);

    angular.module('ambersive.popup').run(['$rootScope','$log','$timeout','HelperSrv','$compile','popupSettings',
        function ($rootScope, $log,$timeout,HelperSrv,$compile,popupSettings) {

            try {
                $timeout(function() {
                    var html = HelperSrv.template.forUrl(popupSettings.modalAreaTemplateUrl);
                    if (html === '' || html === null || html === undefined) {
                        throw 'ambersive.popup: template is empty';
                    } else {
                        var body = angular.element(document).find('body').eq(0);
                        body.append($compile(html)($rootScope));
                    }
                },100);
            } catch(err){
                $log.error(err);
            }

        }
    ]);

    angular.module('ambersive.popup').directive('popup', ['$compile','HelperSrv','$log','popupSettings','PopupSrv',
        function ($compile,HelperSrv,$log,popupSettings,PopupSrv) {
            var directive = {};
            directive.restrict = 'E';
            directive.scope = {
                'name':'@?',
                'settings':'=?',
                'ctrl':'@'
            };
            directive.replace = true;
            directive.transclude = true;
            directive.controller = ['$scope','$rootScope','$controller',function($scope,$rootScope,$controller){

                var cssClass = '';

                $scope.text = {};
                $scope.template = {};
                $scope.data = {};

                if($scope.ctrl === undefined){
                    $scope.ctrl = 'PopupModalCtrl';
                }

                $scope.getCss = function(){
                    return cssClass;
                };

                $scope.init = function(){

                    var generateTemplate = function(area){
                        var html = '';
                        if(area === 'footer' && ($scope.settings[area] !== undefined && ($scope.settings[area].content === 'default' || $scope.settings[area].url === 'default' || $scope.settings[area].standard === true))){
                            html = HelperSrv.template.forUrl(popupSettings.modalFooterTemplateUrl);
                            $scope.data[area] = html;
                        }
                        else if($scope.settings[area] !== undefined && $scope.settings[area].content !== undefined){
                            $scope.data[area] = $scope.settings[area].content;
                        }
                        else if($scope.settings[area] !== undefined && $scope.settings[area].url !== undefined){
                            html = HelperSrv.template.forUrl($scope.settings[area].url);
                            if (html === '' || html === null || html === undefined) {
                                $log.warn('ambersive.popup: cannot load html content for '+area+' area of popup. Maybe the content is empty?');
                            } else {
                                $scope.data[area] = html;
                            }
                        }
                    };

                    $scope.data.headline = $scope.settings.headline;

                    // SIZE

                    switch($scope.settings.size){
                        case 'small':
                            cssClass = 'modal-sm';
                            break;
                        case 'large':
                            cssClass = 'modal-lg';
                            break;
                        default:
                            cssClass = '';
                            break;
                    }

                    // MAIN

                    generateTemplate('main');

                    // FOOTER

                    generateTemplate('footer');

                    // TEXT

                    if($scope.settings.text !== undefined){
                        if($scope.settings.text.close !== undefined){ $scope.text.close = $scope.settings.text.close; }
                        if($scope.settings.text.submit !== undefined){ $scope.text.submit = $scope.settings.text.submit; }
                    }

                    if($scope.text.close === undefined){
                        $scope.text.close = popupSettings.modalTextClose;
                    }

                    if($scope.text.submit === undefined){
                        $scope.text.submit = popupSettings.modalTextSubmit;
                    }

                    // GLOBAL

                    if($scope.settings.global !== undefined && $scope.settings.global.templateUrl !== undefined){
                        $scope.template.url = $scope.settings.global.templateUrl;
                    } else {
                        $scope.template.url = popupSettings.modalTemplateUrl;
                    }

                    $rootScope.$broadcast('loadedPopup' + $scope.name.toUpperCase(), $scope.settings);

                };

                $scope.close = function(e){
                    if(e !== undefined){e.preventDefault();}
                    $rootScope.$broadcast('closePopup', {});
                };

                $scope.submit = function(e){
                    if(e !== undefined){e.preventDefault();}
                    if($scope.settings.submit !== undefined){
                        $scope.settings.submit(function(close){
                            if(close  === true) {
                                PopupSrv.close();
                            }
                        });
                    } else {
                        $rootScope.$broadcast('submitPopup' + $scope.name.toUpperCase(), $scope.settings);
                    }
                };

                // Load additonal controller

                var counter = 0;
                var loadedCtrl = function (ctrl) {
                    if(ctrl === undefined){
                        return;
                    }
                    try {
                        return $controller(ctrl, {
                            $scope: $scope
                        });
                    } catch (err) {
                        $log.error(err);
                    }
                };

                loadedCtrl($scope.ctrl);

                $scope.init();

            }];

            directive.link = function(scope,element,attrs){
                try {
                    var html = HelperSrv.template.forUrl(scope.template.url);
                    if (html !== '' && html !== null && html !== undefined) {
                        element.html(html);
                        element.replaceWith($compile(element.html())(scope));
                    } else {
                        throw('ambersive.popup html ist empty');
                    }
                } catch(err){
                    alert(err);
                }
            };

            return directive;
        }
    ]);

    angular.module('ambersive.popup').controller('PopupAreaCtrl',['$scope','$rootScope','PopupSrv','$timeout','$log',
        function($scope,$rootScope,PopupSrv,$timeout,$log){

            var popupArea = this,
                cssClass = '',
                style = {'style':'none'};

            popupArea.getStyle = function(){
                return style;
            };

            popupArea.getCss = function(){
                return cssClass;
            };

            popupArea.currentPopup = null;
            popupArea.settings = {};
            popupArea.popup = '';

            $scope.$on('loadPopup', function(event, args) {

                    popupArea.popup = '';
                    style.display = 'block';

                    if (args.name === undefined || args.name === popupArea.currentPopup) {
                        return;
                    } else {
                        popupArea.currentPopup = args.name;
                        popupArea.settings = args.settings;
                    }
                    $timeout(function () {
                        popupArea.popup = '<popup settings="popupArea.settings" name="'+popupArea.currentPopup+'"></popup>';
                        $timeout(function () {
                            cssClass = 'in';
                        }, 100);
                    },100);

            });

            $scope.$on('closePopup', function(event, args) {
                cssClass = '';
                $timeout(function () {
                    style.display = 'none';
                    popupArea.popup = '';
                    popupArea.currentPopup = null;
                    PopupSrv.removePopup();
                    $rootScope.$broadcast('checkPopup',{});
                }, 800);
            });

        }
    ]);

    angular.module('ambersive.popup').controller('PopupModalCtrl',['$timeout','$scope','$rootScope',
        function($timeout,$scope,$rootScope){

        }
    ]);

})(window, document, undefined);