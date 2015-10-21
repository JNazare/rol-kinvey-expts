require('./modules/config');
require('./modules/controllers');
require('./modules/services');
let initialized = false;

function constructQuery(path, query, attribute){
  var value = path.split("/").slice(-1).pop();
  query.equalTo(attribute, value);
  return query
}

const app = angular.module('Kinvey', [
  'ionic',
  'kinvey',
  'config',
  'controllers',
  'services'
]);

app.config(function($logProvider) {
  'ngInject';

  // Enable log
  $logProvider.debugEnabled(true);
});

app.config(function($stateProvider) {
  'ngInject';

  // Setup the states
  $stateProvider
    .state('welcome', {
      url: '',
      templateUrl: 'views/welcome.html',
      data: {
        requiresAuthorization: false
      },
      controller: 'WelcomeCtrl as vm'
    })
    .state('logout', {
      url: '/logout',
      data: {
        requiresAuthorization: true
      },
      controller: function($state, Auth) {
        'ngInject';

        Auth.logout().then(function() {
          $state.go('welcome');
        });
      }
    })
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'views/menu.html',
      controller: 'MenuCtrl as vm'
    })
    .state('books', {
      parent: 'app',
      url: '/library',
      views: {
        content: {
          templateUrl: 'views/library.html',
          controller: 'BooksCtrl as vm',
          resolve: {
            books: function(DataStore) {
              'ngInject';
              return DataStore.find('books');
            }
          }
        }
      },
      data: {
        requiresAuthorization: true
      }
    })
    .state('pages', {
      parent: 'app',
      url: '/read/:bookId',
      views: {
        content: {
          templateUrl: 'views/read.html',
          controller: 'PagesCtrl as vm',
          resolve: {
            pages: function(DataStore, $kinvey, $location) {
              'ngInject';
              return DataStore.find('pages', constructQuery($location.path(), new $kinvey.Query(), 'bookId'));
            },
            book: function(DataStore, $kinvey, $location) {
              return DataStore.find('books', constructQuery($location.path(), new $kinvey.Query(), '_id'));
            }
          }
        }
      },
      data: {
        requiresAuthorization: true
      }
    });
});

app.run(function($ionicPlatform, $kinvey, $rootScope, $state, KinveyConfig, Auth) {
  'ngInject';

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
    toState.data = toState.data || {};

    if (!initialized) {
      event.preventDefault();

      // Initialize Kinvey
      $kinvey.init(KinveyConfig).then(function() {
        initialized = true;
        $state.go(toState.name, toParams);
      });
    } else if (toState.data.requiresAuthorization && !$kinvey.getActiveUser()) {
      event.preventDefault();

      // Login
      Auth.login().then(function() {
        $state.go(toState.name, toParams);
      });
    }
  });

  $ionicPlatform.ready(function() {
    const cordova = window.cordova;
    const StatusBar = window.StatusBar;

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (cordova && cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if (StatusBar) {
      StatusBar.styleDefault();
    }
  });

  $state.go('welcome');
});
