# POPUP/MODAL Service for AngularJS

This Service offers the possibility to generate multiple modal dialogs and show it in a row.

### Version
1.0.0.2

### Installation

#### Step 1

```sh
$ bower install ambersive-popup
```

You also need our ambersive-helper module.

```sh
$ bower install ambersive-helper
```

#### Step 2
You first have to declare the 'ambersive.popup' and 'ambersive.helper' module dependency inside your app module (perhaps inside your app main module).

```sh
angular.module('app', ['ambersive.popup','ambersive.helper']);
```
### Useage

```sh

angular.module('app', ['ambersive.popup'])
   .controller('DemoController',function($scope,PopupSrv,$rootScope){

        $scope.open = function() {

            var settings = {
                'name': 'UniqueName', // required
                'settings': {
                    'headline': 'Test Headline for single',
                    'size': 'large',
                    'main': {
                        'content': 'This is a test'
                    }
                }
            };

            PopupSrv.open(settings).then(function (popup) {
                $rootScope.$on('submitPopup' + popup.unique, function (event, args) {

                    popup.close();

                });
            });
        };


});
```

### Settings

```sh
{
    'name':'UNIQUENAME',
    'settings':{
        'headline':'HEADLINE',
        'size':'small/normal/large',
        'main':{
            'content':'Content' // OR
            'url':'Url to template'
        },
        'footer':{
            'content':'Content' // OR
            'url':'Url to template'
        },
        'submit':function(closePopup){
            // Triggered on submit - Do your stuff
            closePopup(true);
        },
        'text':{
            'close':'Close-Button Text',
            'submit':'Submit-Button Text'
        }
    }
}
```

License
----
MIT