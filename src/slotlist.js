function SlotList(max) {
  this.max         = max;
  this.count       = 0;
  this.next        = 0;
  this.available   = [];
}

SlotList.prototype.current = function () {
  if (this.available.length) {
    return this.available[0];
  }
  return this.next;
}

SlotList.prototype.increment = function () {
  if (this.available.length) {
    this.available.shift();
  } else {
    this.next ++;
  }
  this.count ++;
}

SlotList.prototype.decrement = function (index) {
  this.available.push(index);
  this.count --;
}

SlotList.prototype.vacancies = function () {
  return this.available.length + this.max - this.count;
}

module.exports = SlotList