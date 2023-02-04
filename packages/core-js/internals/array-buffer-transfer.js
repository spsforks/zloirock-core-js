var global = require('../internals/global');
var uncurryThis = require('../internals/function-uncurry-this');
var uncurryThisAccessor = require('../internals/function-uncurry-this-accessor');
var toIndex = require('../internals/to-index');
var isDetached = require('../internals/array-buffer-is-detached');
var arrayBufferByteLength = require('../internals/array-buffer-byte-length');
var PROPER_TRANSFER = require('../internals/structured-clone-proper-transfer');

var TypeError = global.TypeError;
var structuredClone = global.structuredClone;
var ArrayBuffer = global.ArrayBuffer;
var DataView = global.DataView;
var ArrayBufferPrototype = ArrayBuffer.prototype;
var DataViewPrototype = DataView.prototype;
var slice = uncurryThis(ArrayBufferPrototype.slice);
var isResizable = uncurryThisAccessor(ArrayBufferPrototype, 'resizable', 'get');
var maxByteLength = uncurryThisAccessor(ArrayBufferPrototype, 'maxByteLength', 'get');
var getInt8 = uncurryThis(DataViewPrototype.getInt8);
var setInt8 = uncurryThis(DataViewPrototype.setInt8);

module.exports = PROPER_TRANSFER && function (arrayBuffer, newLength, preserveResizability) {
  var byteLength = arrayBufferByteLength(arrayBuffer);
  var newByteLength = newLength === undefined ? byteLength : toIndex(newLength);
  if (isDetached(arrayBuffer)) throw TypeError('ArrayBuffer is detached');
  var newBuffer = structuredClone(arrayBuffer, { transfer: [arrayBuffer] });
  if (byteLength <= newByteLength) return newBuffer;
  if (!preserveResizability || !isResizable || !isResizable(newBuffer)) return slice(newBuffer, 0, newByteLength);
  var newNewBuffer = new ArrayBuffer(newByteLength, maxByteLength && { maxByteLength: maxByteLength(newBuffer) });
  var a = new DataView(newBuffer);
  var b = new DataView(newNewBuffer);
  for (var i = 0; i < newByteLength; i++) setInt8(b, i, getInt8(a, i));
  return newNewBuffer;
};
