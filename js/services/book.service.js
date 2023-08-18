"use strict";
//FIXME:
//TODO:

const gTrans = {
  title: {
    he: "😄📚! ברוכים הבאים לחנות הספרים שלי",
    en: "Welcome to my book shop !😄📚",
  },
  createBook: {
    he: "הוסף ספר חדש",
    en: "Create New Book",
  },
  minRate: {
    he: "דירוג מינימלי",
    en: "Minimum rate",
  },
  searchByName: {
    he: "חיפוש לפי שם",
    en: "Search by name",
  },
  sortBy: {
    he: "מיין לפי",
    en: "Sort by",
  },
  priceSort: {
    he: "מחיר",
    en: "Price",
  },
  nameSort: {
    he: "שם",
    en: "Name",
  },
  read: {
    he: "קריאה",
    en: "Read",
  },
  update: {
    he: "עדכון",
    en: "Update",
  },
  delete: {
    he: "מחיקה",
    en: "Delete",
  },
  prevPage: {
    he: "עמוד קודם",
    en: "Prev Page",
  },
  nextPage: {
    he: "הבא הבא",
    en: "Next Page",
  },
  cheap: {
    he: "זול: ",
    en: "Cheap: ",
  },
  normal: {
    he: "נורמלי: ",
    en: "Normal: ",
  },
  expensive: {
    he: "יקר: ",
    en: "Expensive: ",
  },
  id: {
    he: "מזהה",
    en: "Id",
  },
  bookTitle: {
    he: "כותרת",
    en: "Title",
  },
  price: {
    he: "מחיר",
    en: "Price",
  },
  actions: {
    he: "פעולות",
    en: "Actions",
  },
  rate: {
    he: "דירוג",
    en: "Rate",
  },
  desc: {
    he: "תיאור",
    en: "Description",
  },
  descText: {
    he: makeLoremHebrew(60),
    en: makeLorem(60),
  },
  addBookMsg: {
    he: "✅!הספר נוסף בהצלחה",
    en: "Your book has been successfully added!✅",
  },
  removeBookMsg: {
    he: "✅!הספר נמחק בהצלחה",
    en: "Your book has been successfully romoved!✅",
  },
  askBookNameFromUser: {
    he: "הכנס בבקשה את שם הספר",
    en: "Please enter a book name",
  },
  askBookPriceFromUser: {
    he: "הכנס בבקשה את מחיר הספר",
    en: "Please enter a book price",
  },
};

const STORAGE_KEY = "booksDB";
const PAGE_SIZE = 5;

var gCurrLang = "en";
var gBooks;
var gPageIdx = 0;
var gFilterBy = { minRate: 0, name: "" };
var gBooksCount = { expensive: 0, normal: 0, cheap: 0 };

_createBooks();
_getBooksCount();

function _createBooks() {
  
  //create
  var books = loadFromStorage(STORAGE_KEY);

  if (!books || !books.length) {
    //if local storage is empty
    var books = [];
    var bookNames = [
      "Harry Potter",
      "Matilda",
      "Twilight",
      "The Wave",
      "Hunger Game",
      "Ratatouille",
      "Pirates of the Caribbean",
      "Finding Nemo",
      "Toy Story",
      "Up",
      "WALL-E",
      "The Lion King",
    ];
    var imgUrls = ["", "", "", "", "", "", "", "", "", "", "", ""];

    for (var i = 0; i < bookNames.length; i++) {
      var name = bookNames[i];
      var price = getRandomIntInclusive(30, 300);
      var imgUrl = imgUrls[i];
      books.push(_createBook(name, price, imgUrl));
    }
  }
  gBooks = books;
  _saveBooksToStorage();
}

function _createBook(name, price, imgUrl) {
  //create
  return {
    id: makeId(),
    name,
    price,
    imgUrl,
    rate: 0,
  };
}

function _getBooksCount() {
  gBooks.forEach((book) => {
    if (book.price <= 50) gBooksCount.cheap++;
    else if (book.price <= 150) gBooksCount.normal++;
    else gBooksCount.expensive++;
  });
}

function _updateBooksCount(bookId, numToUpdate) {
  var book = gBooks.find((book) => book.id === bookId);
  if (book.price <= 50) gBooksCount.cheap += numToUpdate;
  else if (book.price <= 150) gBooksCount.normal += numToUpdate;
  else gBooksCount.expensive += numToUpdate;
}

function getBooks() {
  //list
  var books = gBooks.filter(
    (book) =>
      book.rate >= gFilterBy.minRate &&
      book.name.toLowerCase().includes(gFilterBy.name)
  );
  var startIdx = gPageIdx * PAGE_SIZE;
  var lastIdx = gPageIdx * PAGE_SIZE + PAGE_SIZE;
  books = books.slice(startIdx, lastIdx);
  return books;
}

function removeBook(bookId) {
  //delete
  var bookIdx = gBooks.findIndex((book) => book.id === bookId);
  _updateBooksCount(bookId, -1);
  gBooks.splice(bookIdx, 1);
  _saveBooksToStorage();
}

function addBook(name, price) {
  //create
  const book = _createBook(name, price, "");
  gBooks.unshift(book);
  _updateBooksCount(book.id, 1);
  _saveBooksToStorage();
}

function updateBook(bookId, newPrice) {
  //update
  var book = gBooks.find((book) => book.id === bookId);
  _updateBooksCount(book.id, -1);
  book.price = newPrice;
  _updateBooksCount(book.id, 1);
  _saveBooksToStorage();
}

function getBookById(bookId) {
  //read
  return gBooks.find((book) => book.id === bookId);
}

function setFilterBy(filterBy) {
  // {minRate: 7}
  if (filterBy.minRate !== undefined) gFilterBy.minRate = filterBy.minRate;
  if (filterBy.name !== undefined) gFilterBy.name = filterBy.name.toLowerCase();
  if (filterBy.id !== undefined) gFilterBy.id = filterBy.id; /////////////////////////////////////////
  if (filterBy.lang !== undefined) gFilterBy.lang = filterBy.lang; /////////////////////////////////////////
  return gFilterBy;
}

function _saveBooksToStorage() {
  saveToStorage(STORAGE_KEY, gBooks);
}

function sortBy(sortKey) {
  if (sortKey !== undefined) {
    gBooks.sort((book1, book2) => {
      if (book1[sortKey] > book2[sortKey]) return 1;
      if (book2[sortKey] > book1[sortKey]) return -1;
      return 0;
    });
  }
}

function getNextPage(isNext) {
  if (isNext && gPageIdx * PAGE_SIZE + PAGE_SIZE >= gBooks.length)
    return "last"; //already on last page

  if (!isNext && gPageIdx <= 0) return "first"; //already on first page

  if (isNext) {
    gPageIdx++;
    if (gPageIdx * PAGE_SIZE + PAGE_SIZE >= gBooks.length) return "last";
  } else {
    gPageIdx--;
    if (gPageIdx <= 0) return "first";
  }
}

function setLang(elLanguage) {
  if (!elLanguage.value) return;

  if (elLanguage.value === gCurrLang) return;
  else gCurrLang = elLanguage.value;

  var elmentsToChange = document.querySelectorAll("[data-trans]");
  elmentsToChange.forEach((el) => {
    if (el.placeholder) el.placeholder = gTrans[el.dataset.trans][gCurrLang];
    else el.innerText = gTrans[el.dataset.trans][gCurrLang];
  });
}

function getNgbKeys(books) {
  books.forEach((book, idx) => {
    if (idx === 0) book.before = null;
    else book.before = books[idx - 1].id;
    if (idx === books.length - 1) book.after = null;
    else book.after = books[idx + 1].id;
  });
  return books
}
