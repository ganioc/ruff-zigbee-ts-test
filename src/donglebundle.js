"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dongle_1 = require("./dongle");
var Events = require("events");
var _ = require("underscore");
var zigbee_utils_1 = require("./zigbee_utils");
var yasync_1 = require("./yasync");
var zigbee = new zigbee_utils_1.ZigbeeUtils();
var DongleBundle = /** @class */ (function () {
    function DongleBundle(uarts) {
        var _this = this;
        this.emitter = new Events.EventEmitter();
        this.dongles = [];
        uarts.forEach(function (m) {
            //this.uarts.push(m);
            _this.dongles.push(new dongle_1.Dongle(m));
        });
        console.log(this.dongles.length + " dongles");
        this.dongles.forEach(function (m) {
            m.emitter.on('data', function (data) {
                _this.emitter.emit('data', { data: data, dongle: m });
            });
        });
    }
    DongleBundle.prototype.getDongleById = function (id) {
        return _.find(this.dongles, function (m) {
            return id === m.ID;
        });
    };
    DongleBundle.prototype.getDongleBySerial = function (serial) {
        return _.find(this.dongles, function (m) {
            return serial === m.serial;
        });
    };
    DongleBundle.prototype.checkLocalFiles = function (storage) {
        storage.checkFileDeviceList();
        storage.checkFileRelationList();
    };
    DongleBundle.prototype.checkDongles = function (zigbee) {
        var lst = [];
        var i = 1;
        this.dongles.forEach(function (m) {
            console.log("check usb dongle");
            //console.log(m);
            lst.push(function (callback) {
                setTimeout(function () {
                    zigbee.getVersion(m.uart);
                    callback(null, i++);
                }, 100);
            });
        });
        yasync_1.YAsync.series(lst, function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Finished checkDongles");
                console.log(data);
            }
        });
    };
    DongleBundle.prototype.checkDongleNames = function (objLst) {
        this.dongles.forEach(function (m) {
            console.log("\nCheck dongle:");
            //console.log(m);
            var d = _.find(objLst.DeviceList, function (n) {
                return n.id_hex === m.ID;
            });
            if (d) {
                console.log("Dongle found:");
                console.log("ID:" + m.ID);
                console.log("Name:" + m.name);
                console.log("Serial:" + m.serial);
                console.log("\n");
                //m.name = d.name;
            }
            else {
                throw new Error("Dongle init incomplete!");
                //console.log("Dongle Not found in config.json\n");
            }
        });
    };
    DongleBundle.prototype.dongleInfo = function () {
        var str = [];
        this.dongles.forEach(function (m) {
            str.push({
                ID: m.ID,
                name: m.name,
                serial: m.serial
            });
        });
        return str;
    };
    DongleBundle.prototype.print = function () {
        console.log("\n================================");
        console.log("Print dongleBundle");
        var i = 1;
        this.dongles.forEach(function (m) {
            console.log("\nNo " + i++);
            m.print();
            console.log("");
        });
        console.log("==================================\n");
    };
    DongleBundle.prototype.reset = function () {
        var lst = [];
        var i = 1;
        this.dongles.forEach(function (m) {
            console.log("reset usb dongle");
            //console.log(m);
            lst.push(function (callback) {
                setTimeout(function () {
                    zigbee.reset(m.uart);
                    callback(null, i++);
                }, 100);
            });
        });
        yasync_1.YAsync.series(lst, function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Finished reset");
                console.log(data);
            }
        });
    };
    DongleBundle.prototype.startNetwork = function () {
        var lst = [];
        var i = 1;
        this.dongles.forEach(function (m) {
            console.log("reset usb dongle");
            //console.log(m);
            lst.push(function (callback) {
                setTimeout(function () {
                    zigbee.startNetwork(m.uart);
                    callback(null, i++);
                }, 100);
            });
        });
        yasync_1.YAsync.series(lst, function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Finished startNetwork");
                console.log(data);
            }
        });
    };
    return DongleBundle;
}());
exports.DongleBundle = DongleBundle;
