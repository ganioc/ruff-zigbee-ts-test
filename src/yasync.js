"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var YAsync = (function () {
    function YAsync() {
    }
    YAsync.series = function (arr, cb) {
        var mIndex = 0;
        var lstResult = [];
        function funcCallback(err, data) {
            if (err) {
                cb(err, lstResult);
                return;
            }
            else {
                lstResult.push(data);
            }
            mIndex++;
            if (mIndex < arr.length) {
                arr[mIndex](funcCallback);
            }
            else {
                cb(null, lstResult);
            }
        }
        if (arr.constructor !== Array || arr.length === 0) {
            throw new Error('Not an array');
        }
        arr.forEach(function (e) {
            if (typeof e !== 'function')
                throw new Error('Not a function');
        });
        arr[0](funcCallback);
    };
    return YAsync;
}());
exports.YAsync = YAsync;
var YPromise = (function () {
    function YPromise() {
        this._curFunc = null;
        this._err = null;
        this._data = null;
        this._queueThen = [];
    }
    YPromise.prototype.getFunc = function (index) {
        var f = this._queueThen.shift();
        if (f) {
            return f[index];
        }
        else {
            return null;
        }
    };
    ;
    YPromise.prototype.when = function (func) {
        var that = this;
        if (func === null) {
            return null;
        }
        func(function (err, data) {
            if (err) {
                that.when(that.getFunc(1));
            }
            else {
                that.when(that.getFunc(0));
            }
        });
        return this;
    };
    ;
    YPromise.prototype.then = function (funcY, funcN) {
        this._queueThen.push([funcY, funcN]);
        return this;
    };
    ;
    return YPromise;
}());
exports.YPromise = YPromise;
