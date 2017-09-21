
export class YAsync {
    static series(arr: any[], cb: (err: Error | null, data: any) => void) {
        var mIndex = 0;
        var lstResult: any[] = [];

        function funcCallback(err: Error | null, data: any) {
            if (err) {
                cb(err, lstResult);
                return;
            } else {
                lstResult.push(data);
            }

            mIndex++;

            if (mIndex < arr.length) {
                arr[mIndex](funcCallback);
            } else {
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

    }

}
export class YPromise {

    _curFunc: any;
    _err: any;
    _data: any;
    _queueThen: any[];


    constructor() {
        this._curFunc = null;
        this._err = null;
        this._data = null;


        this._queueThen = [];
    }

    getFunc(index: number) {
        var f = this._queueThen.shift();

        if (f) {
            return f[index];
        } else {
            return null;
        }
    };


    when(func: any) {
        var that = this;

        if (func === null) {
            return null;
        }

        func(function (err: Error, data: any) {
            if (err) {
                that.when(that.getFunc(1));
            } else {
                that.when(that.getFunc(0));
            }
        });

        return this;
    };

    then(funcY: any, funcN: any) {

        this._queueThen.push([funcY, funcN]);

        return this;
    };


}