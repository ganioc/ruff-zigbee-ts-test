"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dgram = require("dgram");
var zigbee_utils_1 = require("./zigbee_utils");
var device_1 = require("./device");
var os = require("os");
//let manager = new DeviceManager();
var zigbee = new zigbee_utils_1.ZigbeeUtils();
var UdpServer = /** @class */ (function () {
    function UdpServer(storage, manager, dongleBundle) {
        // this.zigbee = zigbee;
        this.storage = storage;
        this.manager = manager;
        this.dongleBundle = dongleBundle;
        this.server = dgram.createSocket('udp4');
    }
    // broadcast(msg:string){
    //     this.server.send(msg, );
    // }
    UdpServer.prototype.isFromSameIP = function (inIP) {
        var interfaces = os.networkInterfaces();
        // console.log("compare IP " + this.server.address().address);
        console.log(interfaces);
        console.log(interfaces.wlan0);
        console.log(interfaces.wlan0.length);
        console.log(interfaces.wlan0[0]);
        var str = interfaces.wlan0[0];
        try {
            console.log("IP address:" + str.ip);
        }
        catch (e) {
            console.log(e);
        }
        if (str.ip === inIP) {
            return true;
        }
        else {
            return false;
        }
    };
    UdpServer.prototype.start = function (options) {
        var _this = this;
        this.PORT = options.port || UdpServer.DEFALUT_PORT;
        this.GATEWAY_ID = options.id || 'gateway_number';
        this.server.bind(this.PORT);
        this.server.on("listening", function () {
            var address = _this.server.address();
            console.log("server listening " +
                address.address + ":" + address.port);
        });
        this.server.on("error", function (err) {
            console.log("server error:\n" + err.stack);
            _this.server.close();
        });
        this.server.on("message", function (msg, rinfo) {
            console.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);
            var msgObj;
            // if receive from the same ip, dump it
            if (_this.isFromSameIP(rinfo.address)) {
                return;
            }
            try {
                msgObj = JSON.parse(msg.toString());
            }
            catch (e) {
                console.log("wrong JSON msg");
                console.log(e);
                _this.server.send("wrong JSON msg:" + msg, 0, msg.length + "wrong JSON msg:".length, rinfo.port, rinfo.address, function (err, bytes) {
                    if (err)
                        throw err;
                });
                return;
            }
            var feedback = _this.parse(msgObj);
            var msg2 = JSON.stringify(feedback);
            _this.server.send(msg2, 0, msg2.length, rinfo.port, rinfo.address, function (err, bytes) {
                if (err)
                    throw err;
            });
        });
    };
    UdpServer.prototype.parse = function (msg) {
        // ----------- parse messages -------------
        if (msg.cmd == 'ping') {
            console.log("Ping received at udp server:" + UdpServer.DEFALUT_PORT);
            return {
                cmd: msg.cmd + '_rsp',
                content: "servername:" + this.GATEWAY_ID
            };
            //return parse_cmd_ping(msg);
        }
        else if (msg.cmd == 'startnetwork') {
            var uart = void 0;
            zigbee.startNetwork(uart);
            return {
                cmd: msg.cmd + '_rsp'
            };
        }
        else if (msg.cmd == 'cleandevicelist') {
            var uart = void 0;
            this.storage.clearDeviceList();
            return {
                cmd: msg.cmd + '_rsp'
            };
        }
        else if (msg.cmd == 'cleanrelationlist') {
            this.storage.clearRelationList();
            return {
                cmd: msg.cmd + '_rsp'
            };
        }
        else if (msg.cmd == 'permitjoining') {
            var dongle = this.dongleBundle.getDongleById(msg.dongleID);
            if (dongle) {
                zigbee.permitJoiningRequest(dongle.uart);
            }
            else {
                return {
                    cmd: msg.cmd + '_rsp',
                    content: "No dongle found"
                };
            }
            return {
                cmd: msg.cmd + '_rsp'
            };
        }
        else if (msg.cmd == 'listdevices') {
            return {
                cmd: msg.cmd + '_rsp',
                content: JSON.stringify(this.storage.getDeviceList())
            };
        }
        else if (msg.cmd == 'listrelations') {
            return {
                cmd: msg.cmd + '_rsp',
                content: JSON.stringify(this.storage.getRelationList())
            };
        }
        else if (msg.cmd == 'savedevicelist') {
            this.storage.writeList('deviceList');
            return {
                cmd: msg.cmd + '_rsp'
            };
        }
        else if (msg.cmd == 'saverelationlist') {
            this.storage.writeList('relationList');
            return {
                cmd: msg.cmd + '_rsp'
            };
        }
        else if (msg.cmd == 'onlinedevices') {
            return {
                cmd: msg.cmd + '_rsp',
                content: JSON.stringify(this.storage.getDeviceList())
            };
        }
        else if (msg.cmd == 'name') {
            console.log('===IEEEaddr: ' + msg.IEEEAddress);
            console.log('===name: ' + msg.name);
            this.manager.setName(msg.name, msg.IEEEAddress);
            return {
                cmd: msg.cmd + '_rsp'
            };
        }
        else if (msg.cmd == 'relation') {
            console.log('\n rx relation cmd');
            console.log(msg);
            console.log('===relation name: ' + msg.relationName);
            console.log('===emitter Long address: ' + msg.emitterLong);
            console.log('===receiver Long address: ' + msg.receiverLong);
            if (msg.emitterLong == undefined) {
                console.log("emitterLong :" + msg.emitterLong);
                return {
                    cmd: msg.cmd + '_rsp',
                    content: "NOK: no emitterLong"
                };
            }
            if (msg.receiverLong == undefined) {
                console.log("receiverLong :" + msg.receiverLong);
                return {
                    cmd: msg.cmd + '_rsp',
                    content: "NOK: no receiverLong"
                };
            }
            var emitter = this.manager.findDeviceLongAddress(msg.emitterLong);
            var receiver = this.manager.findDeviceLongAddress(msg.receiverLong);
            var eButton = null;
            var rButton = null;
            if (!emitter) {
                console.log("emitter not found:" + msg.emitterLong);
                return {
                    cmd: msg.cmd + '_rsp',
                    content: "NOK: emitter not found"
                };
            }
            if (!receiver) {
                console.log("receiver not found" + msg.receiverLong);
                return {
                    cmd: msg.cmd + '_rsp',
                    content: "NOK: receiver not found"
                };
            }
            console.log('===emitter button: ' + msg.emitterButton);
            if (msg.emitterButton == 'left' || msg.emitterButton == 'single') {
                eButton = 'left';
            }
            else if (msg.emitterButton == 'right') {
                eButton = 'right';
            }
            else {
                return {
                    cmd: msg.cmd + '_rsp',
                    content: "NOK: wrong emitterButton:" + msg.emitterButton
                };
            }
            console.log('===receiver button: ' + msg.receiverButton);
            if (msg.receiverButton == 'left' || msg.receiverButton == 'single') {
                rButton = 'left';
            }
            else if (msg.receiverButton == 'right') {
                rButton = 'right';
            }
            else {
                return {
                    cmd: msg.cmd + '_rsp',
                    content: "NOK: no receiverButton: " + msg.receiverButton
                };
            }
            this.manager.setRelation(msg.relationName, emitter, receiver, eButton, rButton);
            return {
                cmd: msg.cmd + '_rsp'
            };
        }
        else if (msg.cmd == 'removedevice') {
            console.log('--- remove device IEEE: ' + msg.IEEEAddress);
            this.manager.removeDevice(msg.IEEEAddress);
            return {
                cmd: msg.cmd + '_rsp'
            };
        }
        else if (msg.cmd == 'removerelation') {
            console.log('--- remove relation name: ' + msg.name);
            this.manager.removeRelation(msg.name);
            return {
                cmd: msg.cmd + '_rsp'
            };
        }
        else if (msg.cmd == 'checkstatus') {
            console.log('check device with long address: ' + msg.longAddress);
            var endPoint = 0x2;
            if (msg.button == 'left') {
                endPoint = 0x2;
            }
            else if (msg.button == 'right') {
                endPoint = 0x3;
            }
            var dev = this.manager.findDeviceLongAddress(msg.longAddress);
            if (dev && (dev.type === device_1.Device.SINGLE_SOCKET || dev.type === device_1.Device.DOUBLE_SOCKET)) {
                var dongle = this.dongleBundle.getDongleById(dev.dongleID);
                if (dongle) {
                    zigbee.checkLightStatus(dongle.uart, parseInt(dev.shortAddress), endPoint);
                }
            }
            else {
                console.log('Only can check status of light');
            }
            return {
                cmd: msg.cmd + '_rsp'
            };
        }
        else if (msg.cmd == 'control') {
            console.log('---- control device: ' + msg.receiverLong + '  ' + msg.receiverButton + '  state: ' + msg.command);
            var endPoint = 0x2;
            if (msg.receiverButton == 'left') {
                endPoint = 0x2;
            }
            else if (msg.receiverButton == 'right') {
                endPoint = 0x3;
            }
            else if (msg.receiverButton == 'single') {
                endPoint = 0x02;
            }
            var dev = this.manager.findDeviceLongAddress(msg.receiverLong);
            if (!dev) {
                return {
                    cmd: msg.cmd + '_rsp',
                    content: 'Wrong IEEEAddress: ' + msg.receiverLong
                };
            }
            var dongle = this.dongleBundle.getDongleById(dev.dongleID);
            if (!dongle) {
                return {
                    cmd: msg.cmd + '_rsp',
                    content: 'Wrong dongleID: ' + dev.dongleID
                };
            }
            if (msg.command == 'on') {
                zigbee.custTurnLightOn(dongle.uart, parseInt(dev.shortAddress), endPoint);
            }
            else if (msg.command == 'off') {
                zigbee.custTurnLightOff(dongle.uart, parseInt(dev.shortAddress), endPoint);
            }
            return {
                cmd: msg.cmd + '_rsp'
            };
        }
        else if (msg.cmd == 'combine') {
            console.log('---- combine device: ' + msg.emitterIEEEAddress + '  ' + msg.receiverIEEEAddress);
            var eObj = void 0, rObj = void 0;
            eObj = this.manager.findDeviceLongAddress(msg.emitterIEEEAddress);
            if (!eObj) {
                return {
                    cmd: msg.cmd + '_rsp',
                    content: 'Wrong emitterIEEEAddress:' + msg.emitterIEEEAddress
                };
            }
            rObj = this.manager.findDeviceLongAddress(msg.receiverIEEEAddress);
            if (!rObj) {
                return {
                    cmd: msg.cmd + '_rsp',
                    content: 'Wrong receiverIEEEAddress:' + msg.receiverIEEEAddress
                };
            }
            // add relation
            if (eObj.type === device_1.Device.DOUBLE_SWITCH) {
                if (rObj.type === device_1.Device.SINGLE_SOCKET) {
                    this.manager.setRelation(eObj.IEEEAddress.slice(-6) + '_' + rObj.IEEEAddress.slice(-6) + '_' + 'left_left', eObj, rObj, 'left', 'left');
                    this.manager.setRelation(eObj.IEEEAddress.slice(-6) + '_' + rObj.IEEEAddress.slice(-6) + '_' + 'right_left', eObj, rObj, 'right', 'left');
                }
                else if (rObj.type === device_1.Device.DOUBLE_SOCKET) {
                    this.manager.setRelation(eObj.IEEEAddress.slice(-6) + '_' + rObj.IEEEAddress.slice(-6) + '_' + 'left_left', eObj, rObj, 'left', 'left');
                    this.manager.setRelation(eObj.IEEEAddress.slice(-6) + '_' + rObj.IEEEAddress.slice(-6) + '_' + 'right_left', eObj, rObj, 'right', 'left');
                    this.manager.setRelation(eObj.IEEEAddress.slice(-6) + '_' + rObj.IEEEAddress.slice(-6) + '_' + 'left_right', eObj, rObj, 'left', 'right');
                    this.manager.setRelation(eObj.IEEEAddress.slice(-6) + '_' + rObj.IEEEAddress.slice(-6) + '_' + 'right_right', eObj, rObj, 'right', 'right');
                }
            }
            else {
                return {
                    cmd: msg.cmd + '_rsp',
                    content: 'Unrecognized emitter type:' + eObj.type
                };
            }
            return {
                cmd: msg.cmd + '_rsp'
            };
        }
        else if (msg.cmd == 'life') {
            var lifeList_1 = new Array();
            this.storage.getDeviceList().forEach(function (m) {
                var timeFromLastUpdate = (new Date().getTime()) - m.onlineLastUpdate;
                lifeList_1.push({
                    deviceID: m.deviceID,
                    shortAddress: m.shortAddress,
                    IEEEAddress: m.IEEEAddress,
                    timeFromLastUpdate: timeFromLastUpdate
                });
            });
            return {
                cmd: msg.cmd + '_rsp',
                content: lifeList_1
            };
        }
        else if (msg.cmd == 'listdongles') {
            console.log('===listdongles: ');
            //console.log('===name: ' + msg.name);
            return {
                cmd: msg.cmd + '_rsp',
                content: this.dongleBundle.dongleInfo()
            };
        }
        else if (msg.cmd == 'toall') {
            console.log('===toall: ');
            if (msg.action) {
                console.log("msg.action:" + msg.action);
            }
            else {
                console.log("No msg.action");
                return;
            }
            if (msg.action === "on") {
                this.manager.turnOnAll(function () { });
            }
            else if (msg.action === "off") {
                this.manager.turnOffAll(function () { });
            }
            else {
                return {
                    cmd: msg.cmd + '_rsp',
                    content: "Unrecognized action :" + msg.action
                };
            }
            return {
                cmd: msg.cmd + '_rsp',
                content: "OK"
            };
        }
        else {
            return {
                cmd: 'unknown_cmd'
            };
        }
    };
    UdpServer.DEFALUT_PORT = 33333;
    return UdpServer;
}());
exports.UdpServer = UdpServer;
