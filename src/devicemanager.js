"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("underscore");
var device_1 = require("./device");
var relation_1 = require("./relation");
var util = require("util");
var zigbee_utils_1 = require("./zigbee_utils");
var dgram = require("dgram");
var timers_1 = require("timers");
//let zigbee = new ZigbeeUtils();
var client = dgram.createSocket("udp4");
var zigbee = new zigbee_utils_1.ZigbeeUtils();
client.bind(function () {
    client.setBroadcast(true);
});
var DeviceManager = /** @class */ (function () {
    function DeviceManager(storage, dongleBundle) {
        this.bInProcessing = false;
        //this.zigbee = zigbee;
        this.storage = storage;
        this.dongleBundle = dongleBundle;
    }
    // find device through short address from message
    DeviceManager.prototype.findDeviceShortAddress = function (shortAddress) {
        var obj = _.find(this.storage.deviceList, function (dev) {
            return dev.shortAddress === shortAddress;
        });
        return obj;
    };
    // find device through long address from message
    DeviceManager.prototype.findDeviceLongAddress = function (IEEEAddress) {
        var obj = _.find(this.storage.deviceList, function (dev) {
            return dev.IEEEAddress == IEEEAddress;
        });
        return obj;
    };
    // find device through device ID from devicelist
    DeviceManager.prototype.findDeviceID = function (deviceID) {
        var obj = _.find(this.storage.deviceList, function (dev) {
            return dev.deviceID === deviceID;
        });
        return obj;
    };
    DeviceManager.prototype.addDevice = function (dev) {
        this.storage.getDeviceList().push(dev);
    };
    // ------------- list managment ------------
    DeviceManager.prototype.removeDevice = function (IEEEAddress) {
        console.log('--- remove device, IEEE: ' + IEEEAddress);
        for (var i in this.storage.getDeviceList()) {
            if (this.storage.deviceList[i].IEEEAddress === IEEEAddress) {
                console.log("removed, IEEE:" + IEEEAddress);
                console.log(this.storage.deviceList[i]);
                this.storage.deviceList.splice(parseInt(i), 1);
                break;
            }
        }
        // remove IEEEAddress from relationList
        for (var j in this.storage.relationList) {
            if (IEEEAddress == this.storage.relationList[j].emitterIEEEAddress ||
                IEEEAddress == this.storage.relationList[j].receiverIEEEAddress) {
                console.log('Relation removed:' + IEEEAddress);
                console.log(this.storage.relationList[j]);
                this.storage.relationList.splice(parseInt(j), 1);
            }
        }
    };
    /**
     * We will use longAddress, ika, IEEEADDRESS as the only confident ID representıı
     * @param listName
     * @param longAddress
     */
    DeviceManager.prototype.isDeviceJoined = function (IEEEAddress) {
        for (var i = 0; i < this.storage.deviceList.length; i++) {
            // TODO should be device unique identifier
            if (this.storage.deviceList[i].IEEEAddress === IEEEAddress) {
                return true;
            }
        }
        return false;
    };
    // new device
    DeviceManager.prototype.newDevice = function (msg, dongleID) {
        console.log('\nAdd new device');
        console.log("--- IEEEADDR: " + msg.IEEEAddress);
        // create new device instance
        var myDevice = new device_1.Device({
            shortAddress: msg.shortAddress,
            IEEEAddress: msg.IEEEAddress,
            type: device_1.Device.UNKNOWN,
            online: true,
            onlineLastUpdate: new Date().getTime(),
            deviceID: device_1.Device.EMPTY_NAME,
            dongleID: dongleID
        });
        console.log('Push new device into the deviceList');
        console.log(myDevice);
        this.storage.deviceList.push(myDevice);
    };
    // ---------------- usr interface functions ----------------
    // set device name
    DeviceManager.prototype.setName = function (deviceID, IEEEAddress) {
        if (deviceID.length <= 2) {
            console.log("Wrong deviceID, too short( >2 bytes )");
        }
        var obj = this.findDeviceLongAddress(IEEEAddress);
        if (obj) {
            obj.deviceID = deviceID;
            console.log('Set device ' + IEEEAddress + ' \'s name to ' + obj.deviceID);
        }
        else {
            console.log('Cannot find device with IEEEAdress:' + IEEEAddress);
        }
    };
    // create new relation
    /**
     * @param  {string} relationName
     * @param  {Device} emitter
     * @param  {Device} receiver
     * @param  {string} ebutton, left, right
     * @param  {string} rbutton, left, right
     */
    DeviceManager.prototype.setRelation = function (relationName, emitter, receiver, ebutton, rbutton) {
        var ebutton1, rbutton1, newRelation;
        // if newRelation does not exist
        var relation;
        relation = _.find(this.storage.getRelationList(), function (m) {
            return (relationName === m.name);
        });
        if (relation) {
            console.log("Relation name already exists");
            return;
        }
        relation = _.find(this.storage.getRelationList(), function (m) {
            return (emitter.IEEEAddress === m.emitterIEEEAddress &&
                receiver.IEEEAddress === m.receiverIEEEAddress &&
                ebutton === m.eEP &&
                rbutton === m.rEP);
        });
        if (relation) {
            console.log("Relation already exists");
            return;
        }
        else {
            console.log("New relation to be added");
        }
        newRelation = new relation_1.Relation({
            name: relationName,
            emitterIEEEAddress: emitter.IEEEAddress,
            receiverIEEEAddress: receiver.IEEEAddress,
            eEP: ebutton,
            rEP: rbutton
        });
        console.log('--- relation update: ' + util.inspect(newRelation, {
            depth: 12
        }));
        this.storage.getRelationList().push(newRelation);
    };
    DeviceManager.prototype.removeRelation = function (relationName) {
        for (var i in this.storage.relationList) {
            if (this.storage.relationList[i].name == relationName) {
                console.log("Relation removed:" + this.storage.relationList[i]);
                this.storage.relationList.splice(parseInt(i), 1);
                return;
            }
        }
        console.log("Cannot find relation: " + relationName);
    };
    // ---------- functions for reading messages -----------
    DeviceManager.prototype.leaveDevice = function (obj) {
        console.log('--- print leave obj');
        //console.log(obj);
        if (obj) {
            obj.online = false;
            obj.onlineLastUpdate = new Date().getTime();
            console.log('Device Leave:' + obj.IEEEAddress + ':' + obj.shortAddress);
            console.log(obj);
        }
    };
    /**
     * Maybe I should change the way announceDevice
     * Should I add the device in advance?
     * Should I add a unrecognized device automatically?
     * @param obj
     * @param msg
     */
    DeviceManager.prototype.announceDevice = function (obj, shortAddress) {
        if (obj) {
            obj.online = true;
            obj.onlineLastUpdate = new Date().getTime();
            console.log('Device Online:' + obj.IEEEAddress);
            if (obj.shortAddress !== shortAddress) {
                console.log('Old shortAddress:' + obj.shortAddress);
                console.log('New shortAddress:' + shortAddress);
                obj.shortAddress = shortAddress;
            }
            else {
                console.log('ShortAddress unchanged:' + obj.shortAddress);
            }
            console.log(obj);
        }
    };
    DeviceManager.prototype.createNewDevice = function (obj, data) {
        if (obj.type == device_1.Device.SINGLE_SWITCH) {
            var singleSwitch = new device_1.SingleSwitchDevice({
                shortAddress: obj.shortAddress,
                IEEEAddress: obj.IEEEAddress,
                type: obj.type,
                online: true,
                deviceID: obj.deviceID,
                dongleID: obj.dongleID
            });
            this.removeDevice(obj.IEEEAddress);
            this.addDevice(singleSwitch);
        }
        else if (obj.type == device_1.Device.DOUBLE_SWITCH) {
            var doubleSwitch = new device_1.DoubleSwitchDevice({
                shortAddress: obj.shortAddress,
                IEEEAddress: obj.IEEEAddress,
                type: obj.type,
                online: true,
                deviceID: obj.deviceID,
                dongleID: obj.dongleID
            });
            this.removeDevice(obj.IEEEAddress);
            this.addDevice(doubleSwitch);
        }
        else if (obj.type == device_1.Device.SINGLE_SOCKET) {
            var singleSocket = new device_1.SingleSocketDevice({
                shortAddress: obj.shortAddress,
                IEEEAddress: obj.IEEEAddress,
                type: obj.type,
                online: true,
                deviceID: obj.deviceID,
                dongleID: obj.dongleID,
                state: device_1.Device.OFF,
                stateLastUpdate: 0
            });
            this.removeDevice(obj.IEEEAddress);
            this.addDevice(singleSocket);
        }
        else if (obj.type == device_1.Device.DOUBLE_SOCKET) {
            var doubleSocket = new device_1.DoubleSocketDevice({
                shortAddress: obj.shortAddress,
                IEEEAddress: obj.IEEEAddress,
                type: obj.type,
                online: true,
                deviceID: obj.deviceID,
                dongleID: obj.dongleID,
                leftState: device_1.Device.OFF,
                leftStateLastUpdate: 0,
                rightState: device_1.Device.OFF,
                rightStateLastUpdate: 0
            });
            this.removeDevice(obj.IEEEAddress);
            this.addDevice(doubleSocket);
        }
        else {
            // impossible to run to here
            console.log("Unrecognized new device type");
        }
    };
    DeviceManager.prototype.translateDeviceType = function (data) {
        var buf = data.attributeData.slice(data.attributeData.length - 4, data.attributeData.length);
        if (buf == '7731') {
            return device_1.Device.SINGLE_SWITCH;
        }
        else if (buf == '7732') {
            return device_1.Device.DOUBLE_SWITCH;
        }
        else if (buf == '6c31') {
            return device_1.Device.SINGLE_SOCKET;
        }
        else if (buf == '6c32') {
            return device_1.Device.DOUBLE_SOCKET;
        }
        else {
            console.log("Unrecognized device type:" + buf);
            return device_1.Device.UNKNOWN;
        }
    };
    DeviceManager.prototype.updateLightDeviceType = function (data) {
        var type;
        var obj;
        if (data.attributeID !== '0x0005') {
            console.log("AttributeID is not 0x0005,  no need to update Device Type.");
            return;
        }
        obj = this.findDeviceShortAddress(data.shortAddress);
        if (!obj) {
            console.log("Device not found: " + data.shortAddress);
            return;
        }
        console.log('\n<-- type update triggered');
        type = this.translateDeviceType(data);
        if (obj.type != type) {
            // it means the device has just been created but 
            // without proper type 
            console.log("Update device type from " + obj.type + " to " + type);
            obj.type = type;
            this.createNewDevice(obj, data);
        }
        else {
            console.log("No need to update device type:" + obj.type);
        }
    };
    DeviceManager.prototype.updateSingleSocketOnOffState = function (obj, data) {
        console.log("%% update SingleSocket onoff Device state:");
        if (data.endPoint == device_1.Device.EP_SOCKET) {
            if (data.status == '0x01') {
                console.log('single socket on');
                obj.state = device_1.Device.ON;
            }
            else if (data.status == '0x00') {
                console.log('single socket state off');
                obj.state = device_1.Device.OFF;
            }
            obj.stateLastUpdate = new Date().getTime();
        }
    };
    DeviceManager.prototype.updateDoubleSocketOnOffState = function (obj, data) {
        console.log("%% update DoubleSocket onOff Device state:");
        if (data.endPoint == device_1.Device.LEFT_EP_SOCKET || data.endPoint == '0x04') {
            console.log("Left socket ");
            if (data.status == '0x01') {
                console.log('left socket state on');
                obj.leftState = device_1.Device.ON;
            }
            else if (data.status == '0x00') {
                console.log('left socket state off');
                obj.leftState = device_1.Device.OFF;
            }
            else {
                console.log('Unrecognized data status');
            }
            obj.leftStateLastUpdate = new Date().getTime();
        }
        else if (data.endPoint == device_1.Device.RIGHT_EP_SOCKET || data.endPoint == '0x05') {
            console.log("Right socket ");
            if (data.status == '0x01') {
                console.log('right socket on');
                obj.rightState = device_1.Device.ON;
            }
            else if (data.status == '0x00') {
                console.log('right socket state off');
                obj.rightState = device_1.Device.OFF;
            }
            obj.rightStateLastUpdate = new Date().getTime();
        }
        else {
            console.log("Unrecognized EP: " + data.endPoint);
        }
    };
    //updateOnOffState(obj: DeviceClass.Device, data: Interpreter.MessageReadAttributeResponse);
    DeviceManager.prototype.updateOnOffState = function (data) {
        if (!(data.clusterID == '0x0006' && data.attributeID == '0x0000')) {
            return;
        }
        var obj = this.findDeviceShortAddress(data.shortAddress);
        if (!obj) {
            console.log("Device not found");
            return;
        }
        obj.online = true;
        obj.onlineLastUpdate = new Date().getTime();
        var dev;
        if (obj.type == device_1.Device.SINGLE_SOCKET) {
            dev = obj;
            this.updateSingleSocketOnOffState(dev, data);
        }
        else if (obj.type == device_1.Device.DOUBLE_SOCKET) {
            dev = obj;
            this.updateDoubleSocketOnOffState(dev, data);
        }
        else {
            console.log("Not supported Light Socket device type" + obj.type);
        }
    };
    DeviceManager.prototype.updateControlAction = function (uart, data) {
        if (!(data.clusterID == '0x0006' && data.attributeID == '0x0000')) {
            console.log("AttributeID is not 0x0006,  no need to handle.");
            return;
        }
        var obj = this.findDeviceShortAddress(data.shortAddress);
        if (!obj) {
            console.log("Device not found");
            return;
        }
        obj.online = true;
        obj.onlineLastUpdate = new Date().getTime();
        // single switch
        if (obj.type == device_1.Device.SINGLE_SWITCH) {
            // check relationlist and send the corresponding on/off command
            //loopRelationList();
            console.log("Single Switch property");
            console.log("Single Switch is not supported");
        }
        else if (obj.type == device_1.Device.DOUBLE_SWITCH) {
            console.log("Double Switch property");
            if (data.endPoint == device_1.Device.LEFT_EP_SWITCH &&
                data.status == device_1.Device.SWITCH_KEYDOWN) {
                this.processControl(uart, obj.IEEEAddress, device_1.Device.LEFT_EP_SWITCH, device_1.Device.OFF);
            }
            else if (data.endPoint == device_1.Device.RIGHT_EP_SWITCH &&
                data.status == device_1.Device.SWITCH_KEYDOWN) {
                this.processControl(uart, obj.IEEEAddress, device_1.Device.RIGHT_EP_SWITCH, device_1.Device.ON);
            }
        }
        else {
            console.log("Not supported Switch device type" + obj.type);
        }
    };
    DeviceManager.prototype.checkStateUpdateValid = function (t) {
        var time = new Date().getTime();
        console.log('t: ' + t + '  time:' + time + ' delta:' + (time - t));
        if ((time - t) > DeviceManager.updateWarranty) {
            return false;
        }
        else {
            return true;
        }
    };
    DeviceManager.prototype.checkControlEntitySingleSocket = function (rIEEEAddress, rEP, action) {
        var device = this.findDeviceLongAddress(rIEEEAddress);
        var singleDevice;
        if (!device) {
            console.log("Cannot find device:" + rIEEEAddress);
            return false;
        }
        singleDevice = device;
        console.log('entity single socket, state:' + singleDevice.state + '  action:' + action);
        if ((singleDevice.state != action) ||
            (!this.checkStateUpdateValid(singleDevice.stateLastUpdate))) {
            return true;
        }
        return false;
    };
    DeviceManager.prototype.checkControlEntityDoubleSocket = function (IEEEAddress, EP, action) {
        var device = this.findDeviceLongAddress(IEEEAddress);
        var doubleDevice;
        if (!device) {
            console.log("Cannot find device:" + IEEEAddress);
            return false;
        }
        doubleDevice = device;
        if (EP == "left" && (doubleDevice.leftState != action || (!this.checkStateUpdateValid(doubleDevice.leftStateLastUpdate)))) {
            return true;
        }
        else if (EP == "right" &&
            (doubleDevice.rightState != action || (!this.checkStateUpdateValid(doubleDevice.rightStateLastUpdate)))) {
            return true;
        }
        return false;
    };
    DeviceManager.prototype.checkControlEntity = function (IEEEAddress, rEP, action) {
        var device = this.findDeviceLongAddress(IEEEAddress);
        if (!device) {
            console.log("Cannot find device:" + IEEEAddress);
            return false;
        }
        // device found
        if (device.type == device_1.Device.DOUBLE_SOCKET) {
            console.log("device type is doublesocket");
            return this.checkControlEntityDoubleSocket(IEEEAddress, rEP, action);
        }
        else if (device.type == device_1.Device.SINGLE_SOCKET) {
            console.log("device type is singlesocket");
            return this.checkControlEntitySingleSocket(IEEEAddress, rEP, action);
        }
        else {
            console.log("Can not know the device type:" + device.type);
        }
        return false;
    };
    DeviceManager.prototype.transEpToNum = function (ep) {
        switch (ep) {
            case 'left':
                return device_1.Device.LEFT_EP_SOCKET;
            case 'right':
                return device_1.Device.RIGHT_EP_SOCKET;
            case 'single':
                return device_1.Device.EP_SOCKET;
            default:
                throw new Error('unrecognized Ep string');
        }
    };
    /**
     * return a list of devices need to be handleda
     *
     * @param eEP "left","right"
     * @param action
     */
    DeviceManager.prototype.getDevicesByDemand = function (IEEEAddress, eEP, action) {
        var deviceList = [];
        var that = this;
        console.log('getDevicesByCommand');
        console.log("IEEEAddress: " + IEEEAddress + "  ep:" + eEP + "  action:" + action);
        this.storage.getRelationList().forEach(function (rela) {
            //console.log('\n~~~');
            //console.log(rela);
            if (rela.emitterIEEEAddress == IEEEAddress &&
                rela.eEP == eEP &&
                that.checkControlEntity(rela.receiverIEEEAddress, rela.rEP, action)) {
                deviceList.push({
                    IEEEAddress: rela.receiverIEEEAddress,
                    EP: that.transEpToNum(rela.rEP) //'left' to '0x02'
                });
            }
        });
        return deviceList;
    };
    /**
     *
     *
     * @param  {string} IEEEAddress
     * @param  {string} eEP
     * @param  {number} action
     * @returns void
     *
     * @description {{description}}{{}}
     *
     * @summary Loop the relation list, find the proper
     * * devices which would be controlled by IEEEAddress - eEP
     * combination
     * @eEP , '0x01', '0x02'
     * @action,  0x01, 0x00
     */
    DeviceManager.prototype.processControl = function (uart, IEEEAddress, eEP, action) {
        // loop the relationList
        var that = this;
        var relEEp = "";
        if (this.bInProcessing) {
            console.log("process already in processing");
            return;
        }
        else {
            console.log("process begin, eEP:" + eEP + " action:" + action);
        }
        this.bInProcessing = true;
        if (eEP == '0x01') {
            relEEp = "left";
        }
        else if (eEP == '0x02') {
            relEEp = "right";
        }
        function controlLight(uart, control, act) {
            //var obj = relationsToTrigger.shift();
            var device = that.findDeviceLongAddress(control.IEEEAddress);
            console.log('controlLight:' + ' ' + control.IEEEAddress + ' :' + control.EP);
            if (act == device_1.Device.ON) {
                console.log('--- light on triggered');
                // Here we need EP to be '0x02', '0x03'
                // Where to do the transformation?
                zigbee.custTurnLightOn(uart, parseInt(device.shortAddress), parseInt(control.EP));
            }
            else if (act == device_1.Device.OFF) {
                console.log('--- light off triggered');
                zigbee.custTurnLightOff(uart, parseInt(device.shortAddress), parseInt(control.EP));
            }
            else {
                console.log('error, unrecognized action:' + act);
            }
        }
        function loopDeviceList(uart) {
            var DELAY_TIME = 1000;
            var MAX_LOOP_NUM = 2;
            var indexLoop = 0;
            var indexLight = 0;
            var devicesToTrigger = [];
            devicesToTrigger = that.getDevicesByDemand(IEEEAddress, relEEp, action);
            console.log('devicesToTrigger:');
            console.log(devicesToTrigger);
            console.log('devices length:' + devicesToTrigger.length);
            console.log("\n");
            function processControlList(controlList) {
                console.log('\n=========>  loopDevicelist: ' + indexLoop);
                indexLight = 0;
                var control = controlList.shift();
                if (control) {
                    console.log('-----> light index:' + indexLight++);
                    controlLight(uart, control, action);
                }
                if (controlList.length > 0) {
                    timers_1.setTimeout(function () {
                        processControlList(controlList);
                    }, DELAY_TIME);
                }
                else {
                    timers_1.setTimeout(function () {
                        indexLoop++;
                        devicesToTrigger = that.getDevicesByDemand(IEEEAddress, relEEp, action);
                        console.log('deviceToTrigger');
                        console.log(devicesToTrigger);
                        console.log('devices length:' + devicesToTrigger.length);
                        if (devicesToTrigger.length > 0 && indexLoop < MAX_LOOP_NUM) {
                            console.log("Go to " + indexLoop + " loop");
                            timers_1.setTimeout(function () {
                                processControlList(devicesToTrigger);
                            }, DELAY_TIME);
                        }
                        else {
                            that.bInProcessing = false;
                            console.log("loopDeviceList end");
                        }
                    }, 3000);
                }
            }
            processControlList(devicesToTrigger);
        }
        loopDeviceList(uart);
    };
    // get all the device-ep combinations we should control
    DeviceManager.prototype.getDeviceEntity = function () {
        var devices = [];
        var i = 0;
        this.storage.getDeviceList().forEach(function (dev) {
            console.log('\nNo.' + (++i) + ' device');
            console.log(dev);
            if (dev.type == device_1.Device.DOUBLE_SOCKET) {
                devices.push({
                    IEEEAddress: dev.IEEEAddress,
                    shortAddress: dev.shortAddress,
                    ep: device_1.Device.LEFT_EP_SOCKET,
                    dongleID: dev.dongleID,
                });
                devices.push({
                    IEEEAddress: dev.IEEEAddress,
                    shortAddress: dev.shortAddress,
                    ep: device_1.Device.RIGHT_EP_SOCKET,
                    dongleID: dev.dongleID,
                });
            }
            else if (dev.type == device_1.Device.SINGLE_SOCKET) {
                devices.push({
                    IEEEAddress: dev.IEEEAddress,
                    shortAddress: dev.shortAddress,
                    ep: device_1.Device.EP_SOCKET,
                    dongleID: dev.dongleID,
                });
            }
        });
        return devices;
    };
    DeviceManager.prototype.checkstatusAllLights = function () {
        // loop devices list, send checkstatus command to each light
        var devices = [];
        var indexDevices = 0, i = 0;
        var that = this;
        // if (that.bInProcessing == true) {
        //     return;
        // }
        // that.bInProcessing = true;
        devices = this.getDeviceEntity();
        console.log('check status of devices below:');
        console.log(devices);
        function check() {
            if (indexDevices >= devices.length) {
                // that.bInProcessing = false;
                return;
            }
            var obj = that.findDeviceLongAddress(devices[indexDevices].IEEEAddress);
            console.log('\nCheck devices NO. ' + indexDevices);
            console.log(devices[indexDevices]);
            if (obj) {
                var dongle = that.dongleBundle.getDongleById(devices[indexDevices].dongleID);
                zigbee.checkLightStatus(dongle.uart, parseInt(obj.shortAddress), parseInt(devices[indexDevices].ep));
            }
            else {
                console.log('Cannot find obj of:' + devices[indexDevices].IEEEAddress);
            }
            indexDevices++;
            timers_1.setTimeout(function () {
                check();
            }, 2000);
        }
        check();
    };
    DeviceManager.prototype.createTaskCheckStatus = function (uart) {
        var devices = this.getDeviceEntity();
        var indexDevices = 0;
        var that = this;
        return function () {
            if (that.bInProcessing == true) {
                return;
            }
            that.bInProcessing = true;
            if (indexDevices >= devices.length) {
                indexDevices = 0;
            }
            var obj = that.findDeviceLongAddress(devices[indexDevices].IEEEAddress);
            console.log('\nCheck device status: ' + indexDevices);
            console.log(devices[indexDevices]);
            if (obj) {
                zigbee.checkLightStatus(uart, parseInt(obj.shortAddress), parseInt(devices[indexDevices].ep));
            }
            indexDevices++;
            that.bInProcessing = false;
        };
    };
    DeviceManager.prototype.broadcast = function (inmsg) {
        var ADDR_BROADCAST = "10.0.3.255";
        var PORT = 33333;
        var msg = new Buffer(inmsg);
        console.log("Broadcast out");
        client.send(msg, 0, msg.length, PORT, "10.0.3.255", function (err, bytes) {
            if (err)
                throw err;
            console.log("UDP message sent to :" + ADDR_BROADCAST + ":" + PORT);
        });
    };
    // Use to 
    DeviceManager.prototype.actionOnAll = function (action) {
        // Only send out one time;
        var that = this;
        var DELAY_TIME = 500;
        var devices = this.getDeviceEntity();
        var deviceToTrigger = _.filter(devices, function (m) {
            if (that.checkControlEntity(m.IEEEAddress, device_1.Device.ep2String(m.ep), action)) {
                return true;
            }
            else {
                return false;
            }
        });
        console.log("device list to trigger");
        console.log(deviceToTrigger);
        // trigger all lights
        var index = 0;
        function trigger() {
            if (index === deviceToTrigger.length) {
                return;
            }
            var device = deviceToTrigger[index++];
            var dev = that.findDeviceLongAddress(device.IEEEAddress);
            var dongle = that.dongleBundle.getDongleById(dev.dongleID);
            console.log("trigger:" + index);
            console.log(device);
            console.log(dev);
            if (action === device_1.Device.ON) {
                zigbee.custTurnLightOn(dongle.uart, parseInt(device.shortAddress), parseInt(device.ep));
            }
            else if (action === device_1.Device.OFF) {
                zigbee.custTurnLightOff(dongle.uart, parseInt(device.shortAddress), parseInt(device.ep));
            }
            else {
                console.log("Unrecognized action + " + action);
            }
            timers_1.setTimeout(function () {
                trigger();
            }, DELAY_TIME);
        }
        trigger();
    };
    // Turn on all lamps
    DeviceManager.prototype.turnOnAll = function () {
        console.log("turnOnAll() triggered");
        this.actionOnAll(device_1.Device.ON);
    };
    // Turn off all lamps
    DeviceManager.prototype.turnOffAll = function () {
        console.log("turnOffAll() triggered");
        this.actionOnAll(device_1.Device.OFF);
    };
    DeviceManager.prototype.updateControlFromSwitch = function (data, config) {
        var obj;
        var objSwitch;
        console.log("updateControlFromSwitch");
        if (!(data.clusterID == '0x0006' && data.attributeID == '0x0000')) {
            console.log("AttributeID is not 0x0006,  no need to handle.");
            return;
        }
        obj = this.findDeviceShortAddress(data.shortAddress);
        if (!obj) {
            console.log("Device not found");
            return;
        }
        obj.online = true;
        obj.onlineLastUpdate = new Date().getTime();
        objSwitch = _.find(config.SwitchList, function (m) {
            return obj.IEEEAddress === m.IEEEAddress;
        });
        if (!objSwitch) {
            console.log("Switch is not in dongle_config.json");
            return;
        }
        if (parseInt(objSwitch.type) === device_1.Device.DOUBLE_SWITCH) {
            if (data.endPoint == device_1.Device.LEFT_EP_SWITCH &&
                data.status == device_1.Device.SWITCH_KEYDOWN) {
                this.turnOffAll();
                this.broadcast(JSON.stringify({
                    cmd: 'toall',
                    action: 'off'
                }));
            }
            else if (data.endPoint == device_1.Device.RIGHT_EP_SWITCH &&
                data.status == device_1.Device.SWITCH_KEYDOWN) {
                this.turnOnAll();
                this.broadcast(JSON.stringify({
                    cmd: 'toall',
                    action: 'on'
                }));
            }
        }
        else {
            console.log("switch type is unrecognized");
        }
    };
    DeviceManager.updateWarranty = 300000;
    return DeviceManager;
}());
exports.DeviceManager = DeviceManager;
