"use strict";

const Utility = module.exports = {

  subseq: function (val1, val2) {
    let valA = escape(val1.toLowerCase());
    let valB = escape(val2.toLowerCase());

    let str = "";
    for (let i = 0; i < valB.length; i++) {
      str += `${valB[i]}.*`;
    }

    return ((valA.match(new RegExp(str, "i")) === null) ? false : true);
  },

  /* 
   * Sorts the JSON according to the field in ascending order and returns the array of the keys. 
   */
  jsonSorter: function (json, field) {
    let array = [];
    let newArray = [];
    let jsonCopy = {};
    Object.assign(jsonCopy, json);
  
    // Create an array containing only the 'field' as the elements.
    for (let prop in jsonCopy) {
      array.push(jsonCopy[prop][field]);
    }
  
    // Sort the array of the 'fields'.
    array = Utility.sort(array);
  
    // Push the JSON keys to the returning array.
    for (let i = 0; i < array.length; i++) {
      for (let prop in jsonCopy) {
        if (jsonCopy[prop][field] === array[i]) {
          newArray.push(prop);
          delete jsonCopy[prop];
          break;
        }
      }
    }
  
    return newArray;
  },
  
  sort: function (array) {
    var length = array.length;
  
    for (var i = 1, j; i < length; i++) {
      var temp = array[i];
      for (var j = i - 1; j >= 0 && array[j] > temp; j--) {
        array[j + 1] = array[j];
      }
      array[j + 1] = temp;
    }
  
    return array;
  }
};
