function FakeInputManager() {
  this.events = {};
}

FakeInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

FakeInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

FakeInputManager.prototype.listen = function () {
};

FakeInputManager.prototype.restart = function (event) {
  this.emit("restart");
};

FakeInputManager.prototype.keepPlaying = function (event) {
  this.emit("keepPlaying");
};

FakeInputManager.prototype.bindButtonPress = function () {
};
