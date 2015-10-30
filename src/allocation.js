var util      = require('util')
var SlotList  = require('./slotlist')
var OwnerList = require('./ownerlist')


function Allocation(max) {
  this.slots  = new SlotList(max);
  this.owners = new OwnerList();
  
  this.members  = [];
  this.indexes  = {};
  this.onChange = this.onChange.bind(this)
}
  

Allocation.nextId = 0,
Allocation.deallocate = function (o) {
  var al = o.al, 
      id = o.id, 
      items = o.items, 
      l = items.length;

  for(var i=0;i<l;i++)
    al.remove(items[i], id);
}

Allocation.prototype.maxSlots = function () {
  return this.slots.max;
}

Allocation.prototype.canAccommodate = function (items) {
  var excess = items.length - this.slots.vacancies();
  if (excess <= 0)
    return true;
  for (var i=0; i<items.length && excess > 0; i++) {
    if (this.hasItem(items[i])) {
      excess--;
    }
  }
  return excess <= 0;
}

Allocation.prototype.hasItem = function (item) {
  return item.id in this.indexes;
}

Allocation.prototype.indexFor = function(item) {
  if (!(item.id in this.indexes))
    throw item.id + " not allocated";
  return this.indexes[item.id];
}

Allocation.prototype.add = function (item, owner, fn) {
  var index;
  if (this.hasItem(item)) {
    index = this.indexFor(item);
  } else {
    index = this.slots.current();
    this.members[index] = item;
    this.indexes[item.id] = index;
    this.slots.increment();
    this.write(index, fn(index));
    item.on && item.on('change', this.onChange)
  }
  this.owners.add(index, owner);
  return index;
}

Allocation.prototype.onChange = function (item) {
  if (!isNaN(this.indexes[item.id]))
    this.write(this.indexes[item.id], item.getValue());
}

Allocation.prototype.remove = function (item, owner) {
  if (this.hasItem(item)) {
    var index = this.indexFor(item);
    if (this.owners.remove(index, owner)){
      delete this.members[index];
      delete this.indexes[item.id];
      item.off && item.off('change', this.onChange)
      this.slots.decrement(index);
    }
  }
}

Allocation.prototype.allocate = function (items) {
  items = items.slice();
  var me = this;
  var id = Allocation.nextId ++;
  $.each(items, function (i, item) {
    me.add(item, id);
  });
  return {
    al    : this,
    items : items,
    id    : id
  };
}

var FloatAllocation = Allocation.Float = function (max, numComponents) {
  Allocation.call(this, max)
  this.numComponents   = numComponents
  this.buffer          = new Float32Array(numComponents * max);
}
util.inherits(FloatAllocation, Allocation)


FloatAllocation.prototype.write = function(index, b){
  index = index * this.numComponents
  for(var i=0; i<b.length; i++){
    this.buffer[i + index] = b[i]
  }
}

module.exports = Allocation