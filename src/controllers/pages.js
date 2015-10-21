class PagesCtrl {
  constructor(pages, book) {
    'ngInject';
    this.book = book[0];
    this.pages = pages;
  }
}

export default PagesCtrl;
