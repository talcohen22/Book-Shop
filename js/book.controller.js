"use strict";

var gTimeoutId;

function onInit() {
  updateBooksCount();
  renderFilterByQueryParams();

  var minRate = gFilterBy.minRate
    ? gFilterBy.minRate
    : document.querySelector(".filter-input").min;
  document.querySelector(".min-rate").innerText = "(" + minRate + ")";
  document.querySelector(".prev-btn").classList.add("disable");

  renderBooks();
}

function renderBooks() {
  var books = getBooks();
  books = getNgbKeys(books);
  const haederTable = `<tr><th data-trans="id">${gTrans.id[gCurrLang]}</th><th data-trans="bookTitle">${gTrans.bookTitle[gCurrLang]}</th><th data-trans="price">${gTrans.price[gCurrLang]}</th><th colspan=3 data-trans="actions">${gTrans.actions[gCurrLang]}</th><th data-trans="rate">${gTrans.rate[gCurrLang]}</th></tr>`;
  var strHtml = books.map(
    (book) =>
      `<tr>
            <td>${book.id}</td>
            <td>${book.name}</td>
            <td>${book.price}</td>
            <td><button data-trans="read" class="read-btn table-bth" onclick="onReadBook('${book.id}')">${gTrans.read[gCurrLang]}</button></td>
            <td><button data-trans="update" class="update-btn table-bth" onclick="onUpdateBook('${book.id}')">${gTrans.update[gCurrLang]}</button></td>
            <td><button data-trans="delete" class="delete-btn table-bth" onclick="onRemoveBook('${book.id}')">${gTrans.delete[gCurrLang]}</button></td>
            <td>${book.rate}</td>
        </tr>`
  );
  strHtml.unshift(haederTable);
  document.querySelector("table").innerHTML = strHtml.join("");
}

function onRemoveBook(bookId) {
  //delete
  removeBook(bookId);
  updateBooksCount();
  renderBooks();
  setUserMsg(gTrans.removeBookMsg[gCurrLang]);
}

function onAddBook() {
  //create
  const name = prompt(gTrans.askBookNameFromUser[gCurrLang]);
  const price = +prompt(gTrans.askBookPriceFromUser[gCurrLang]);
  if (name && price) {
    addBook(name, price, "");
    updateBooksCount();
    renderBooks();
    setUserMsg(gTrans.addBookMsg[gCurrLang]);
  }
}

function onUpdateBook(bookId) {
  //update
  const newPrice = +prompt("Please enter a new price");
  if (newPrice) {
    updateBook(bookId, newPrice);
    updateBooksCount();
    renderBooks();
  }
}

function onReadBook(bookId) {
  //read
  var book = getBookById(bookId);
  document.querySelector(".modal").classList.remove("hidden");
  onSetFilterBy({ id: bookId });

  const strHtml = `
    <h2 class="book-name">${book.name}</h2>
    <hr><br>
    <p data-trans="id">${gTrans.id[gCurrLang]}: </p><span class="book-id">${book.id}</span><br><br>
    <p data-trans="price">${gTrans.price[gCurrLang]}: </p><span class="book-price">${book.price}</span><br><br>
    <p data-trans="desc">${gTrans.desc[gCurrLang]}: <br></p><span class="book-desc" data-trans="descText">${gTrans.descText[gCurrLang]}</span><br><br>
    <p data-trans="rate" class="rate">${gTrans.rate[gCurrLang]}: </p>
    <button class="rate-btn-low" onclick="onPlusRating(false)">-</button>
    <span class="span-num">${book.rate}</span>
    <span class="book-id"></span>
    <button class="rate-btn-high" onclick="onPlusRating(true)">+</button>
    
    <button class="x-btn" onclick="onCloseModal()">X</button>`;

  document.querySelector(".modal").innerHTML = strHtml;
}

function onCloseModal() {
  document.querySelector(".modal").classList.add("hidden");
  onSetFilterBy({ id: null });
}

function setUserMsg(msg) {
  clearTimeout(gTimeoutId);
  var elMsg = document.querySelector(".user-msg");
  elMsg.innerText = msg;
  elMsg.classList.add("open");
  gTimeoutId = setTimeout(() => {
    elMsg.classList.remove("open");
  }, 3000);
}

function onPlusRating(isPlus) {
  var bookId = document.querySelector(".book-id").innerText; //FIXME: לבדוק אם יש דרך להביא את הספר מהמודל ולא מהדום!!!!
  var book = getBookById(bookId);

  if (book.rate < 10 && isPlus) book.rate++;
  if (book.rate > 0 && !isPlus) book.rate--;

  document.querySelector(".span-num").innerText = book.rate;
  _saveBooksToStorage(); //TODO: לבדוק אם זה סבבה לגשת ללוקאלסטורז מכאן!!!!
  renderBooks();
}

function onSetFilterBy(filterBy) { //{lang: 'he'}
  //{id: f455}
  var key = Object.keys(filterBy)[0];
  if (key === "minRate") {
    var minRate = document.querySelector(".filter-input").value;
    document.querySelector(".min-rate").innerText = "(" + minRate + ")";
  }

  filterBy = setFilterBy(filterBy);
  renderBooks();
  const queryParams = `?minRate=${filterBy.minRate}&bookId=${filterBy.id}&lang=${filterBy.lang}`;
  const newUrl =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    queryParams;

  window.history.pushState({ path: newUrl }, "", newUrl);
}

function renderFilterByQueryParams() {
  const queryParams = new URLSearchParams(window.location.search);

  const filterBy = {
    minRate: +queryParams.get("minRate") || 0,
    id: queryParams.get("bookId"),
    lang: queryParams.get("lang"),
  };

  document.querySelector(".filter-input").value = filterBy.minRate;

  if(filterBy.lang === null) document.querySelector(".language").value = ""
  else document.querySelector(".language").value = filterBy.lang
  
  setFilterBy(filterBy);
  if (filterBy.id !== "null" && filterBy.id !== null) onReadBook(filterBy.id); 
  if (filterBy.lang) onSetLang(document.querySelector(".language")); 
}

function onSortBy() {
  var sortKey = document.querySelector(".sort");
  if (!sortKey.value) return;
  sortBy(sortKey.value);
  renderBooks();
}

function onGetNextPage(isNext) {
  var lastPage = getNextPage(isNext);
  if (lastPage === "last")
    document.querySelector(".next-btn").classList.add("disable");
  else document.querySelector(".next-btn").classList.remove("disable");
  if (lastPage === "first")
    document.querySelector(".prev-btn").classList.add("disable");
  else document.querySelector(".prev-btn").classList.remove("disable");
  getBooks();
  renderBooks();
}

function updateBooksCount() {
  document.querySelector(".expensive").innerText = gBooksCount.expensive;
  document.querySelector(".normal").innerText = gBooksCount.normal;
  document.querySelector(".cheap").innerText = gBooksCount.cheap;
}

function onSetLang(elLanguage) {
  if(elLanguage.value === "") return
  onSetFilterBy({ lang: elLanguage.value });
  if (elLanguage.value === "he") document.body.classList.add("rtl");
  else document.body.classList.remove("rtl");
  setLang(elLanguage);
  // elLanguage.value = "";
  updateBooksCount();
}
