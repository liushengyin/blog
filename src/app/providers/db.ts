import {Injectable} from '@angular/core';
import idb from 'idb';

@Injectable()
export class db {
    _dbPromise = null;

    constructor() {
      this._dbPromise = this.openDatabase();

    }

    openDatabase() {
      if (!navigator.serviceWorker) {
        return Promise.resolve();
      }

      return idb.open('SY', 1, function(upgradeDb) {
        var store = upgradeDb.createObjectStore('blogs', {
          keyPath: 'id'
        });
        store.createIndex('by-date', 'created_at');
      });
    }

    _showCachedMessages() {

      return this._dbPromise.then((db)=> {
        if (!db ) return;
        var index = db.transaction('blogs')
          .objectStore('blogs').index('by-date');

        return index.getAll().then(function(messages) {
            console.log(messages.reverse())
        });
      });

    };

  _cacheMessage (messages) {

    this._dbPromise.then(function(db) {
      if (!db) return;

      let tx = db.transaction('blogs', 'readwrite');
      let store = tx.objectStore('blogs');
      messages.forEach(function(message) {
        console.log(message);
        store.put(message);
      });

      // limit store to 30 items
      store.index('by-date').openCursor(null, "prev").then(function(cursor) {
        return cursor.advance(30);
      }).then(function deleteRest(cursor) {
        if (!cursor) return;
        cursor.delete();
        return cursor.continue().then(deleteRest);
      });
    });

  };

}
