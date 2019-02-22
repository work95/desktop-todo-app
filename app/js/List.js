function List(buffer, delim) {
  let self = this;
  self.container = {};
  this.keys = [];
  self.length = 0;

  // If no parameter is passed.
  // Default constructor kind-of.
  if (buffer == undefined) {
    return;
  }

  // Temporary holder.
  let list = [];

  // Check the type of object.
  switch (Object.prototype.toString.call(buffer)) {
    // Buffer.
    case "[object Uint8Array]":
      list = buffer.toString().split(delim);
      break;

    // Array.
    case "[object Array]":
      list = buffer;
      break;

    // String.
    case "[object String]":
      list = buffer.split(delim);
      break;
  }

  // Size of the list after it is trimmed (if needed).
  let size = 0;

  // Remove empty or undefined entries.
  for (let i = 0; i < list.length; i++) {
    // If any entry is not legitimate.
    if (list[i] !== "" && list[i] != undefined) {
      self.container[i] = list[i];
      self.order.push(list[i]);
      size++;
    }
  }

  self.length = size;
}

List.prototype.add = function (key, value) {
  this.container[key] = value;
  this.keys.push(key);
  this.length++;
};

List.prototype.remove = function (key) {
  delete this.container[key];
  this.keys.splice(this.keys.indexOf(key), 1);
  this.length--;
};

List.prototype.get = function (key) {
  return this.container[key];
};

List.prototype.toKeyArray = function () {
  let self = this;
  let array = [];

  for (let item in self.container) {
    array.push(item);
  }

  return array;
};

List.prototype.toValueArray = function () {
  let self = this;
  let array = [];

  for (let item in self.container) {
    array.push(self.container[item]);
  }

  return array;
};

List.prototype.toArray = function () {
  return this.toValueArray();
};

module.exports = List;
