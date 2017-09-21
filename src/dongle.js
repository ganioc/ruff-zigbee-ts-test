"use strict";
/**
 * Dongle is physical Zigbee Dongle
 * One gateway will have multiple dongles attached
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Events = require("events");
var Dongle = (function () {
    //deviceList: any[];  //
    function Dongle(uart) {
        var _this = this;
        this.uart = uart;
        this.name = "";
        //this.id = "";
        this.emitter = new Events.EventEmitter();
        this.serial = (Dongle.serialCounter++).toString();
        console.log("Dongle:" + this.serial);
        this.uart.on('data', function (data) {
            console.log("\n\n<<<===");
            if (_this.ID) {
                console.log("Dongle RX: " + _this.serial + " " + _this.ID + " " + _this.name);
            }
            else {
                console.log("Dongle RX: " + _this.serial);
            }
            _this.emitter.emit('data', data);
        });
    }
    Dongle.prototype.checkStorage = function () {
    };
    Dongle.prototype.checkUart = function () {
    };
    Object.defineProperty(Dongle.prototype, "ID", {
        get: function () {
            return this.id;
        },
        set: function (str) {
            this.id = str;
        },
        enumerable: true,
        configurable: true
    });
    Dongle.prototype.setIDByVersion = function (major, install) {
        this.id = major.slice(2) + install.slice(2);
    };
    Dongle.prototype.print = function () {
        console.log("\nDongle " + ": " + this.serial);
        console.log("Name:" + this.name);
        console.log("ID: " + this.ID);
    };
    Dongle.serialCounter = 1001;
    Dongle.ID_LENGTH = 8;
    return Dongle;
}());
exports.Dongle = Dongle;
