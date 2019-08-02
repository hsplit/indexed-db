//prefixes of implementation that we want to test
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

//prefixes of window.IDB objects
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB.")
}

let db;
let request = indexedDB.open("library", 1);

request.onerror = event => {
    log.innerHTML += 'Open error<br>';
    console.log("Error");
    console.dir(event);
};
request.onsuccess = event => {
    db = request.result;
    log.innerHTML += 'Open onsuccess<br>';
    console.log("success");
    console.log(db);

    showDB();
};
request.onupgradeneeded = event => {
    log.innerHTML += 'Open onupgradeneeded<br>';
    console.log("onupgradeneeded");
    let thisDB = event.target.result;
    let objectStore;

    if(!thisDB.objectStoreNames.contains("books")) {
        objectStore = thisDB.createObjectStore("books", {keyPath: "isbn"});
        //objectStore = thisDB.createObjectStore("books", {autoIncrement: true});

        objectStore.createIndex("by_title", "title", {unique: true});
        objectStore.createIndex("by_author", "author", {unique: false});

        objectStore.add({title: "Quarry Memories", author: "Fred", isbn: 123456});
        objectStore.add({title: "Water Buffaloes", author: "Fred", isbn: 234567});
        objectStore.add({title: "Bedrock Nights", author: "Barney", isbn: 345678});
    }
};

function showDB() {
    database.innerHTML = '';
    let count = 0;
    let objectStore = db.transaction("books").objectStore("books");

    objectStore.openCursor().onsuccess = event => {
        let cursor = event.target.result;
        if (cursor) {
            count = count + 1;
            database.innerHTML +=
                `<span style="color: cornflowerblue">cursor.key:</span> ${cursor.key};
                 <span style="color: cornflowerblue">cursor.value.title:</span> ${cursor.value.title};
                 <span style="color: cornflowerblue">cursor.value.author:</span> ${cursor.value.author};
                 <br>`;
            cursor.continue();
        } else {
            database.innerHTML += 'Total: ' + count;
        }
    };
}

function add() {
    let request = db.transaction(["books"], "readwrite").objectStore("books")
        .put({title: mytitle.value, isbn: +myisbn.value, author: myauthor.value});

    request.onsuccess = event => {
        log.innerHTML += 'Added onsuccess<br>';
    };

    request.onerror = event => {
        log.innerHTML += 'Added onerror "aready exist"<br>';
    }
}
addbtn.addEventListener('click', () => {add(); showDB()});

function search() {
    let request = db.transaction(["books"], "readonly").objectStore("books")
        .get(+mysearch.value);

    request.onerror = event => {
        log.innerHTML += 'Search onerror "unable to retrieve"<br>';
    };

    request.onsuccess = event => {
        // Do something with the request.result!
        log.innerHTML += 'Search onsuccess<br>';
        if(request.result) {
            founded.innerHTML =
                `<span style="color: cornflowerblue">request.result.isbn:</span> ${request.result.isbn};
                 <span style="color: cornflowerblue">request.result.title:</span> ${request.result.title};
                 <span style="color: cornflowerblue">request.result.author:</span> ${request.result.author};
                 <br>`;
        } else {
            founded.innerHTML = 'Not found ' + new Date().toLocaleTimeString('ru-RU');
        }
    };
}
searchbtn.addEventListener('click', search);

function remove() {
    let request = db.transaction(["books"], "readwrite").objectStore("books")
        .delete(+mydel.value);

    request.onerror = event => {
        log.innerHTML += 'Remove onerror<br>';
    };

    request.onsuccess = event => {
        log.innerHTML += 'Remove onsuccess<br>';
    };
}
delbtn.addEventListener('click', () => {remove(); showDB()});

function clear() {
    let request = db.transaction(["books"], "readwrite").objectStore("books")
        .clear();

    request.onsuccess = event => {
        log.innerHTML += 'Clear onsuccess<br>';
    };

    request.onerror = event => {
        log.innerHTML += 'Clear onerror<br>';
    }
}
clearbtn.addEventListener('click', () => {clear(); showDB()});

function deleteDB() {
    db.close();
    let request = indexedDB.deleteDatabase("library");

    request.onerror = event => {
        log.innerHTML += 'DeleteDB onerror<br>';
    };

    request.onsuccess = event => {
        log.innerHTML += 'DeleteDB onsuccess<br>';
    };
}
deldbbtn.addEventListener('click', deleteDB);

function showDiap() {
    diap.innerHTML = '';
    let count = 0;
    let objectStore = db.transaction("books").objectStore("books");
    let from = document.querySelector('#myfrom').value;
    let to = document.querySelector('#myto').value;
    let okRange;
    if(from !== '' && to !== '') {
        okRange = IDBKeyRange.bound(+from, +to);
    } else if(from === '') {
        okRange = IDBKeyRange.upperBound(+to);
    } else {
        okRange = IDBKeyRange.lowerBound(+from);
    }

    objectStore.openCursor(okRange).onsuccess = event => {
        let cursor = event.target.result;
        if (cursor) {
            count = count + 1;
            diap.innerHTML +=
                `<span style="color: cornflowerblue">cursor.key:</span> ${cursor.key};
                 <span style="color: cornflowerblue">cursor.value.title:</span> ${cursor.value.title};
                 <span style="color: cornflowerblue">cursor.value.author:</span> ${cursor.value.author};
                 <br>`;
            cursor.continue();
        } else {
            diap.innerHTML += 'Total: ' + count;
        }
    };
}
diaphbtn.addEventListener('click', showDiap);
