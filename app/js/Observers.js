"use strict";

function Observer(target, attributes) {
  let self = this;

  self.target = target;
  self.observableAttributes = attributes;
  self.observer;
};

Observer.prototype.startObservation = function () {
  let self = this;
  self.observer.observe(self.target, self.observableAttributes);
};

Observer.prototype.stopObservation = function () {
  let self = this;
  self.observer.disconnect();
};


module.exports = Observer;

