import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule).then(()=>{
    _registerServiceWorker();
});

function _registerServiceWorker() {
  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.register('service-worker.js').then(function(reg) {

    if (!navigator.serviceWorker.controller) {
      return;
    }

    if (reg.waiting) {
      _updateReady(reg.waiting);
      return;
    }

    if (reg.installing) {
      _trackInstalling(reg.installing);
      return;
    }

    reg.addEventListener('updatefound', function() {
      _trackInstalling(reg.installing);
    });

  });

  // Ensure refresh is only called once.
  // This works around a bug in "force update on reload".
  var refreshing;
  navigator.serviceWorker.addEventListener('controllerchange', function() {
    if (refreshing) return;
    window.location.reload();
    refreshing = true;
  });
};

function _trackInstalling(worker) {
    worker.addEventListener('statechange', function() {
      if (worker.state == 'installed') {
        _updateReady(worker);
      }
    });
};

function _updateReady(worker) {
  worker.postMessage({action: 'skipWaiting'});

// var toast = this._toastsView.show("New version available", {
//   buttons: ['refresh', 'dismiss']
// });

// toast.answer.then(function(answer) {
//   if (answer != 'refresh') return;
//   worker.postMessage({action: 'skipWaiting'});
// });
};
