"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Device = /** @class */ (function () {
    function Device(options) {
        this.shortAddress = options.shortAddress || '0x0000';
        this.IEEEAddress = options.IEEEAddress || '0x0000000000000000';
        this.type = options.type || Device.UNKNOWN;
        this.online = options.online || false;
        this.onlineLastUpdate = options.onlineLastUpdate || new Date().getTime();
        this.deviceID = options.deviceID || Device.EMPTY_NAME;
        this.dongleID = options.dongleID || "00000000";
    }
    Device.ep2String = function (ep) {
        if (ep === Device.LEFT_EP_SOCKET) {
            return 'left';
        }
        else if (ep === Device.RIGHT_EP_SOCKET) {
            return 'right';
        }
        else {
            return '';
        }
    };
    // on off state 
    Device.OFF = 0;
    Device.ON = 1;
    // device type
    Device.SINGLE_SWITCH = 0x10;
    Device.DOUBLE_SWITCH = 0x11;
    Device.SINGLE_SOCKET = 0x20;
    Device.DOUBLE_SOCKET = 0x21;
    Device.UNKNOWN = 0x12;
    //
    Device.EMPTY_NAME = 'emptyName';
    // end point definition
    Device.EP_SWITCH = '0x01';
    Device.LEFT_EP_SWITCH = '0x01';
    Device.RIGHT_EP_SWITCH = '0x02';
    Device.EP_SOCKET = '0x02';
    Device.LEFT_EP_SOCKET = '0x02';
    Device.RIGHT_EP_SOCKET = '0x03';
    Device.SWITCH_KEYDOWN = '0x00';
    Device.SWITCH_KEYUP = '0x01';
    return Device;
}());
exports.Device = Device;
var SingleSwitchDevice = /** @class */ (function (_super) {
    __extends(SingleSwitchDevice, _super);
    function SingleSwitchDevice(options) {
        var _this = _super.call(this, options) || this;
        _this.type = Device.SINGLE_SWITCH;
        return _this;
    }
    return SingleSwitchDevice;
}(Device));
exports.SingleSwitchDevice = SingleSwitchDevice;
var DoubleSwitchDevice = /** @class */ (function (_super) {
    __extends(DoubleSwitchDevice, _super);
    function DoubleSwitchDevice(options) {
        var _this = _super.call(this, options) || this;
        _this.type = Device.DOUBLE_SWITCH;
        return _this;
    }
    return DoubleSwitchDevice;
}(Device));
exports.DoubleSwitchDevice = DoubleSwitchDevice;
var SingleSocketDevice = /** @class */ (function (_super) {
    __extends(SingleSocketDevice, _super);
    function SingleSocketDevice(options) {
        var _this = _super.call(this, options) || this;
        _this.type = Device.SINGLE_SOCKET;
        _this.state = options.state || Device.OFF;
        _this.stateLastUpdate = 0; // if it's not updated, it's zero
        return _this;
    }
    return SingleSocketDevice;
}(Device));
exports.SingleSocketDevice = SingleSocketDevice;
var DoubleSocketDevice = /** @class */ (function (_super) {
    __extends(DoubleSocketDevice, _super);
    function DoubleSocketDevice(options) {
        var _this = _super.call(this, options) || this;
        _this.type = Device.DOUBLE_SOCKET;
        _this.leftState = options.leftState || Device.OFF;
        _this.rightState = options.rightState || Device.OFF;
        _this.leftStateLastUpdate = 0;
        _this.rightStateLastUpdate = 0;
        return _this;
    }
    return DoubleSocketDevice;
}(Device));
exports.DoubleSocketDevice = DoubleSocketDevice;
