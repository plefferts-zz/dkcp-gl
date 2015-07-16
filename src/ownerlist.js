function OwnerList() {
  this.data = {};
}

OwnerList.prototype.add = function (item, owner) {
  var d = this.data;
  if(!d[item])
     d[item] = {count:0, owners:{}};
   d[item].owners[owner]=owner;
   d[item].count++;
}

OwnerList.prototype.remove = function (item, owner) {
  var d = this.data;
  if(d[item] && d[item].owners[owner]) {
    delete d[item].owners[owner];
    d[item].count --;
    return d[item].count < 1;
  }
  return true;
}

module.exports = OwnerList