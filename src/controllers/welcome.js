class WelcomeCtrl {
  constructor($state) {
    'ngInject';

    this.$state = $state;
  }

  getStarted() {
    this.$state.go('books');
  }
}

export default WelcomeCtrl;
