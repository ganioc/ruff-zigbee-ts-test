import _ = require('underscore');
import { DeviceStorage } from './storage';
import { Device, SingleSwitchDevice, DoubleSwitchDevice, DoubleSocketDevice, SingleSocketDevice } from './device';
import { Relation } from './relation';
import util = require('util');
import { ZigbeeUtils } from './zigbee_utils';
import { Interpreter, MessageAnnounce, MessageAttributeReport } from './interpreter';
import { ConfigJSON } from './donglebundle';
import * as dgram from "dgram";
import { DongleBundle } from './donglebundle';
import { setTimeout } from 'timers';

//let zigbee = new ZigbeeUtils();
let client = dgram.createSocket("udp4");

let zigbee = new ZigbeeUtils();

client.bind(function () {
    client.setBroadcast(true);
});

export interface ControlEntity {
    IEEEAddress: string,
    EP: string // 'left', 'right', 'single'
}

export class DeviceManager {

    static readonly updateWarranty = 300000;

    bInProcessing: boolean; // if command processing is not finished
    //zigbee: ZigbeeUtils;
    storage: DeviceStorage;
    dongleBundle: DongleBundle;

    constructor(storage: DeviceStorage, dongleBundle: DongleBundle) {
        this.bInProcessing = false;
        //this.zigbee = zigbee;
        this.storage = storage;
        this.dongleBundle = dongleBundle;
    }

    // find device through short address from message
    findDeviceShortAddress(shortAddress: string): Device {
        var obj = _.find(this.storage.deviceList, function (dev) {
            return dev.shortAddress === shortAddress;
        });
        return obj;
    }
    // find device through long address from message
    findDeviceLongAddress(IEEEAddress: string): Device {
        var obj = _.find(this.storage.deviceList, function (dev) {
            return dev.IEEEAddress == IEEEAddress;
        });
        return obj;
    }
    // find device through device ID from devicelist
    findDeviceID(deviceID: string) {
        var obj = _.find(this.storage.deviceList, function (dev) {
            return dev.deviceID === deviceID;
        });
        return obj;
    }
    addDevice(dev: Device) {
        this.storage.getDeviceList().push(dev);
    }
    // ------------- list managment ------------
    removeDevice(IEEEAddress: string) {
        console.log('--- remove device, IEEE: ' + IEEEAddress);

        for (let i in this.storage.getDeviceList()) {
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
    }

    /**
     * We will use longAddress, ika, IEEEADDRESS as the only confident ID representıı
     * @param listName 
     * @param longAddress 
     */
    isDeviceJoined(IEEEAddress: string) {
        for (var i = 0; i < this.storage.deviceList.length; i++) {
            // TODO should be device unique identifier
            if (this.storage.deviceList[i].IEEEAddress === IEEEAddress) {
                return true;
            }
        }

        return false;
    }

    // new device
    newDevice(msg: MessageAnnounce, dongleID: string): void {
        console.log('\nAdd new device');
        console.log("--- IEEEADDR: " + msg.IEEEAddress);
        // create new device instance
        let myDevice = new Device({
            shortAddress: msg.shortAddress,
            IEEEAddress: msg.IEEEAddress,
            type: Device.UNKNOWN,
            online: true,
            onlineLastUpdate: new Date().getTime(),
            deviceID: Device.EMPTY_NAME,
            dongleID: dongleID
        });

        console.log('Push new device into the deviceList');
        console.log(myDevice);
        this.storage.deviceList.push(myDevice);

    }

    // ---------------- usr interface functions ----------------

    // set device name
    setName(deviceID: string, IEEEAddress: string): void {

        if (deviceID.length <= 2) {
            console.log("Wrong deviceID, too short( >2 bytes )");
        }

        var obj = this.findDeviceLongAddress(IEEEAddress);
        if (obj) {
            obj.deviceID = deviceID;
            console.log('Set device ' + IEEEAddress + ' \'s name to ' + obj.deviceID);
        } else {
            console.log('Cannot find device with IEEEAdress:' + IEEEAddress);
        }
    }

    // create new relation
    /**
     * @param  {string} relationName
     * @param  {Device} emitter
     * @param  {Device} receiver
     * @param  {string} ebutton, left, right 
     * @param  {string} rbutton, left, right 
     */
    setRelation(relationName: string, emitter: Device, receiver: Device, ebutton: string, rbutton: string) {
        let ebutton1: string, rbutton1: string, newRelation: Relation;

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
        } else {
            console.log("New relation to be added");
        }

        newRelation = new Relation({
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
    }

    removeRelation(relationName: string) {
        for (var i in this.storage.relationList) {
            if (this.storage.relationList[i].name == relationName) {
                console.log("Relation removed:" + this.storage.relationList[i]);
                this.storage.relationList.splice(parseInt(i), 1);
                return;
            }
        }
        console.log("Cannot find relation: " + relationName);
    }

    // ---------- functions for reading messages -----------

    leaveDevice(obj: Device) {
        console.log('--- print leave obj');
        //console.log(obj);

        if (obj) {
            obj.online = false;
            obj.onlineLastUpdate = new Date().getTime();
            console.log('Device Leave:' + obj.IEEEAddress + ':' + obj.shortAddress);
            console.log(obj);
        }
    }
    /**
     * Maybe I should change the way announceDevice 
     * Should I add the device in advance?
     * Should I add a unrecognized device automatically?
     * @param obj 
     * @param msg 
     */
    announceDevice(obj, shortAddress: string) {
        if (obj) {
            obj.online = true;
            obj.onlineLastUpdate = new Date().getTime();
            console.log('Device Online:' + obj.IEEEAddress);
            if (obj.shortAddress !== shortAddress) {
                console.log('Old shortAddress:' + obj.shortAddress);
                console.log('New shortAddress:' + shortAddress);
                obj.shortAddress = shortAddress;
            } else {
                console.log('ShortAddress unchanged:' + obj.shortAddress);
            }
            console.log(obj);
        }
    }

    createNewDevice(obj: Device, data: MessageAttributeReport) {
        if (obj.type == Device.SINGLE_SWITCH) {
            var singleSwitch = new SingleSwitchDevice({
                shortAddress: obj.shortAddress,
                IEEEAddress: obj.IEEEAddress,
                type: obj.type,
                online: true,
                deviceID: obj.deviceID,
                dongleID: obj.dongleID
            });
            this.removeDevice(obj.IEEEAddress);
            this.addDevice(singleSwitch);

        } else if (obj.type == Device.DOUBLE_SWITCH) {
            var doubleSwitch = new DoubleSwitchDevice({
                shortAddress: obj.shortAddress,
                IEEEAddress: obj.IEEEAddress,
                type: obj.type,
                online: true,
                deviceID: obj.deviceID,
                dongleID: obj.dongleID
            });
            this.removeDevice(obj.IEEEAddress);
            this.addDevice(doubleSwitch);
        } else if (obj.type == Device.SINGLE_SOCKET) {
            var singleSocket = new SingleSocketDevice({
                shortAddress: obj.shortAddress,
                IEEEAddress: obj.IEEEAddress,
                type: obj.type,
                online: true,
                deviceID: obj.deviceID,
                dongleID: obj.dongleID,
                state: Device.OFF,
                stateLastUpdate: 0
            });
            this.removeDevice(obj.IEEEAddress);
            this.addDevice(singleSocket);
        } else if (obj.type == Device.DOUBLE_SOCKET) {
            var doubleSocket = new DoubleSocketDevice({
                shortAddress: obj.shortAddress,
                IEEEAddress: obj.IEEEAddress,
                type: obj.type,
                online: true,
                deviceID: obj.deviceID,
                dongleID: obj.dongleID,
                leftState: Device.OFF,
                leftStateLastUpdate: 0,
                rightState: Device.OFF,
                rightStateLastUpdate: 0
            });
            this.removeDevice(obj.IEEEAddress);
            this.addDevice(doubleSocket);
        } else {
            // impossible to run to here
            console.log("Unrecognized new device type");

        }
    }
    translateDeviceType(data: MessageAttributeReport): number {

        var buf = data.attributeData.slice(data.attributeData.length - 4, data.attributeData.length);

        if (buf == '7731') {
            return Device.SINGLE_SWITCH;
        } else if (buf == '7732') {
            return Device.DOUBLE_SWITCH;
        } else if (buf == '6c31') {
            return Device.SINGLE_SOCKET;
        } else if (buf == '6c32') {
            return Device.DOUBLE_SOCKET;
        } else {
            console.log("Unrecognized device type:" + buf);
            return Device.UNKNOWN;

        }

    }

    updateLightDeviceType(data: MessageAttributeReport) {
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

    }
    updateSingleSocketOnOffState(obj: SingleSocketDevice, data: MessageAttributeReport) {
        console.log("%% update SingleSocket onoff Device state:");
        if (data.endPoint == Device.EP_SOCKET) {//'0x02'
            if (data.status == '0x01') {

                console.log('single socket on');
                obj.state = Device.ON;
            } else if (data.status == '0x00') {

                console.log('single socket state off');
                obj.state = Device.OFF;
            }
            obj.stateLastUpdate = new Date().getTime();
        }
    }
    updateDoubleSocketOnOffState(obj: DoubleSocketDevice, data: MessageAttributeReport) {

        console.log("%% update DoubleSocket onOff Device state:");
        if (data.endPoint == Device.LEFT_EP_SOCKET || data.endPoint == '0x04') {//left socket '0x02'
            console.log("Left socket ");
            if (data.status == '0x01') {
                console.log('left socket state on');
                obj.leftState = Device.ON;
            } else if (data.status == '0x00') {
                console.log('left socket state off');
                obj.leftState = Device.OFF;
            } else {
                console.log('Unrecognized data status');
            }
            obj.leftStateLastUpdate = new Date().getTime();
        } else if (data.endPoint == Device.RIGHT_EP_SOCKET || data.endPoint == '0x05') {// right socket '0x03'
            console.log("Right socket ");
            if (data.status == '0x01') {
                console.log('right socket on');
                obj.rightState = Device.ON;
            } else if (data.status == '0x00') {
                console.log('right socket state off');
                obj.rightState = Device.OFF;
            }
            obj.rightStateLastUpdate = new Date().getTime();
        } else {
            console.log("Unrecognized EP: " + data.endPoint);
        }
    }
    //updateOnOffState(obj: DeviceClass.Device, data: Interpreter.MessageReadAttributeResponse);
    updateOnOffState(data) {
        if (!(data.clusterID == '0x0006' && data.attributeID == '0x0000')) {
            return;
        }
        let obj = this.findDeviceShortAddress(data.shortAddress);

        if (!obj) {
            console.log("Device not found");
            return;
        }

        obj.online = true;
        obj.onlineLastUpdate = new Date().getTime();

        let dev;
        if (obj.type == Device.SINGLE_SOCKET) {
            dev = <SingleSocketDevice>obj;
            this.updateSingleSocketOnOffState(dev, data);
        }
        else if (obj.type == Device.DOUBLE_SOCKET) {
            dev = <DoubleSocketDevice>obj;
            this.updateDoubleSocketOnOffState(dev, data);
        }
        else {
            console.log("Not supported Light Socket device type" + obj.type);
        }
    }
    updateControlAction(uart, data: MessageAttributeReport) {
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
        if (obj.type == Device.SINGLE_SWITCH) {
            // check relationlist and send the corresponding on/off command
            //loopRelationList();
            console.log("Single Switch property");
            console.log("Single Switch is not supported");
        }
        // double switch
        else if (obj.type == Device.DOUBLE_SWITCH) {
            console.log("Double Switch property");
            if (data.endPoint == Device.LEFT_EP_SWITCH &&
                data.status == Device.SWITCH_KEYDOWN) {
                this.processControl(uart, obj.IEEEAddress, Device.LEFT_EP_SWITCH,
                    Device.OFF);

            } else if (data.endPoint == Device.RIGHT_EP_SWITCH &&
                data.status == Device.SWITCH_KEYDOWN) {

                this.processControl(uart, obj.IEEEAddress, Device.RIGHT_EP_SWITCH,
                    Device.ON);

            }
        } else {
            console.log("Not supported Switch device type" + obj.type);
        }

    }
    checkStateUpdateValid(t: number) {
        var time = new Date().getTime();
        console.log('t: ' + t + '  time:' + time + ' delta:' + (time - t));

        if ((time - t) > DeviceManager.updateWarranty) {
            return false;
        } else {
            return true;
        }
    }
    checkControlEntitySingleSocket(rIEEEAddress: string, rEP: string, action: number): boolean {
        var device = this.findDeviceLongAddress(rIEEEAddress);
        var singleDevice: SingleSocketDevice;

        if (!device) {
            console.log("Cannot find device:" + rIEEEAddress);
            return false;
        }

        singleDevice = <SingleSocketDevice>device;

        console.log('entity single socket, state:' + singleDevice.state + '  action:' + action);

        if ((singleDevice.state != action) ||
            (!this.checkStateUpdateValid(singleDevice.stateLastUpdate))) {
            return true;
        }

        return false;
    }
    checkControlEntityDoubleSocket(IEEEAddress: string, EP: string, action: number): boolean {
        var device = this.findDeviceLongAddress(IEEEAddress);
        var doubleDevice: DoubleSocketDevice;

        if (!device) {
            console.log("Cannot find device:" + IEEEAddress);
            return false;
        }
        doubleDevice = <DoubleSocketDevice>device;

        if (EP == "left" && (
            doubleDevice.leftState != action || (
                !this.checkStateUpdateValid(doubleDevice.leftStateLastUpdate)))) {
            return true;
        } else if (EP == "right" &&
            (doubleDevice.rightState != action || (!this.checkStateUpdateValid(doubleDevice.rightStateLastUpdate)))) {
            return true;
        }

        return false;
    }
    checkControlEntity(IEEEAddress: string, rEP: string, action: number): boolean {
        var device = this.findDeviceLongAddress(IEEEAddress);

        if (!device) {
            console.log("Cannot find device:" + IEEEAddress);
            return false;
        }

        // device found
        if (device.type == Device.DOUBLE_SOCKET) {
            console.log("device type is doublesocket");
            return this.checkControlEntityDoubleSocket(IEEEAddress, rEP, action);
        } else if (device.type == Device.SINGLE_SOCKET) {
            console.log("device type is singlesocket");
            return this.checkControlEntitySingleSocket(IEEEAddress, rEP, action);
        } else {
            console.log("Can not know the device type:" + device.type);
        }

        return false;
    }
    transEpToNum(ep: string): string {
        switch (ep) {
            case 'left':
                return Device.LEFT_EP_SOCKET;
            case 'right':
                return Device.RIGHT_EP_SOCKET;
            case 'single':
                return Device.EP_SOCKET;
            default:
                throw new Error('unrecognized Ep string');
        }
    }
    /**
     * return a list of devices need to be handleda
     * 
     * @param eEP "left","right"
     * @param action 
     */
    getDevicesByDemand(IEEEAddress: string, eEP: string, action: number): ControlEntity[] {
        var deviceList: ControlEntity[] = [];
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
                    EP: that.transEpToNum(rela.rEP)//'left' to '0x02'
                });
            }
        });

        return deviceList;
    }
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
    processControl(uart, IEEEAddress: string, eEP: string, action: number): void {
        // loop the relationList
        var that = this;
        var relEEp = "";

        if (this.bInProcessing) {
            console.log("process already in processing");
            return;
        } else {
            console.log("process begin, eEP:" + eEP + " action:" + action);
        }

        this.bInProcessing = true;

        if (eEP == '0x01') {
            relEEp = "left";
        }
        else if (eEP == '0x02') {
            relEEp = "right";
        }

        function controlLight(uart, control: ControlEntity, act: number) {
            //var obj = relationsToTrigger.shift();
            var device = that.findDeviceLongAddress(control.IEEEAddress);
            console.log('controlLight:' + ' ' + control.IEEEAddress + ' :' + control.EP);
            if (act == Device.ON) {
                console.log('--- light on triggered');
                // Here we need EP to be '0x02', '0x03'
                // Where to do the transformation?

                zigbee.custTurnLightOn(uart, parseInt(device.shortAddress), parseInt(control.EP));
            } else if (act == Device.OFF) {
                console.log('--- light off triggered');
                zigbee.custTurnLightOff(uart, parseInt(device.shortAddress), parseInt(control.EP));
            } else {
                console.log('error, unrecognized action:' + act);
            }
        }
        function loopDeviceList(uart) {
            var DELAY_TIME = 1000;
            var MAX_LOOP_NUM = 2;
            var indexLoop = 0;
            var indexLight = 0;



            var devicesToTrigger: ControlEntity[] = [];

            devicesToTrigger = that.getDevicesByDemand(IEEEAddress, relEEp, action);
            console.log('devicesToTrigger:');
            console.log(devicesToTrigger);
            console.log('devices length:' + devicesToTrigger.length);
            console.log("\n");

            function processControlList(controlList: ControlEntity[]) {

                console.log('\n=========>  loopDevicelist: ' + indexLoop);
                indexLight = 0;

                var control = controlList.shift();

                if (control) {
                    console.log('-----> light index:' + indexLight++);

                    controlLight(uart, control, action);
                }

                if (controlList.length > 0) {
                    setTimeout(function () {
                        processControlList(controlList);
                    }, DELAY_TIME);
                } else {
                    setTimeout(function () {
                        indexLoop++;
                        devicesToTrigger = that.getDevicesByDemand(IEEEAddress, relEEp, action);
                        console.log('deviceToTrigger');
                        console.log(devicesToTrigger);
                        console.log('devices length:' + devicesToTrigger.length);

                        if (devicesToTrigger.length > 0 && indexLoop < MAX_LOOP_NUM) {
                            console.log("Go to " + indexLoop + " loop");
                            setTimeout(function () {
                                processControlList(devicesToTrigger);
                            }, DELAY_TIME);
                        } else {
                            that.bInProcessing = false;
                            console.log("loopDeviceList end");
                        }
                    }, 3000);

                }
            }
            processControlList(devicesToTrigger);
        }

        loopDeviceList(uart);

    }
    // get all the device-ep combinations we should control
    getDeviceEntity() {
        var devices = [];
        var i = 0;

        this.storage.getDeviceList().forEach(function (dev) {
            console.log('\nNo.' + (++i) + ' device');
            console.log(dev);
            if (dev.type == Device.DOUBLE_SOCKET) {
                devices.push(
                    {
                        IEEEAddress: dev.IEEEAddress,
                        shortAddress: dev.shortAddress,
                        ep: Device.LEFT_EP_SOCKET,
                        dongleID: dev.dongleID,
                    });
                devices.push(
                    {
                        IEEEAddress: dev.IEEEAddress,
                        shortAddress: dev.shortAddress,
                        ep: Device.RIGHT_EP_SOCKET,
                        dongleID: dev.dongleID,
                    });
            } else if (dev.type == Device.SINGLE_SOCKET) {
                devices.push(
                    {
                        IEEEAddress: dev.IEEEAddress,
                        shortAddress: dev.shortAddress,
                        ep: Device.EP_SOCKET,
                        dongleID: dev.dongleID,
                    });
            }
        });
        return devices;
    }

    checkstatusAllLights() {
        // loop devices list, send checkstatus command to each light
        var devices = [];
        let indexDevices = 0, i = 0;
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
                let dongle = that.dongleBundle.getDongleById(devices[indexDevices].dongleID);
                zigbee.checkLightStatus(dongle.uart, parseInt(obj.shortAddress), parseInt(devices[indexDevices].ep));
            } else {
                console.log('Cannot find obj of:' + devices[indexDevices].IEEEAddress);
            }

            indexDevices++;

            setTimeout(function () {
                check();
            }, 2000);
        }

        check();

    }
    createTaskCheckStatus(uart) {
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
    }
    broadcast(inmsg: string) {

        let ADDR_BROADCAST = "10.0.3.255";
        let PORT = 33333;
        let msg = new Buffer(inmsg);

        console.log("Broadcast out");

        client.send(
            msg,
            0,
            msg.length,
            PORT,
            "10.0.3.255",
            function (err, bytes) {
                if (err)
                    throw err;
                console.log("UDP message sent to :" + ADDR_BROADCAST + ":" + PORT);
            }
        );
    }
    // Use to 
    actionOnAll(action: number, cb: () => void) {
        // Only send out one time;
        let that = this;
        const DELAY_TIME = 1000;

        let devices = this.getDeviceEntity();
        let deviceToTrigger = _.filter(
            devices,
            function (m) {
                if (that.checkControlEntity(
                    m.IEEEAddress,
                    Device.ep2String(m.ep),
                    action)) {
                    return true;
                } else {
                    return false;
                }
            }
        );
        console.log("device list to trigger ------>");
        console.log(deviceToTrigger);
        console.log("---------device list to trigger---------");

        // trigger all lights
        let index = 0;

        function trigger() {
            if (index === deviceToTrigger.length) {
                console.log("!!!!Trigger action finished");
                cb(); // send out the report
                return;
            }
            let device = deviceToTrigger[index++];
            let dev = that.findDeviceLongAddress(device.IEEEAddress);
            let dongle = that.dongleBundle.getDongleById(dev.dongleID);
            console.log("Trigger action:" + index);
            console.log(device);
            console.log(dev);

            if (action === Device.ON) {
                zigbee.custTurnLightOn(dongle.uart, parseInt(device.shortAddress), parseInt(device.ep));
                setTimeout(() => {
                    zigbee.custTurnLightOn(dongle.uart, parseInt(device.shortAddress), parseInt(device.ep));
                }, 300);
            } else if (action === Device.OFF) {
                zigbee.custTurnLightOff(dongle.uart, parseInt(device.shortAddress), parseInt(device.ep));

                setTimeout(() => {
                    zigbee.custTurnLightOff(dongle.uart, parseInt(device.shortAddress), parseInt(device.ep));
                }, 300);
            } else {
                console.log("Unrecognized action + " + action);
            }
            setTimeout(
                function () {
                    trigger();
                }, DELAY_TIME
            );
        }

        trigger();
    }
    // Turn on all lamps
    turnOnAll(cb) {
        console.log("turnOnAll() triggered");
        this.actionOnAll(Device.ON, cb);
    }
    // Turn off all lamps
    turnOffAll(cb) {
        console.log("turnOffAll() triggered");
        this.actionOnAll(Device.OFF, cb);
    }
    updateControlFromSwitch(data: MessageAttributeReport, config: ConfigJSON): void {
        let obj: Device;
        let objSwitch;

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

        objSwitch = _.find(config.SwitchList, (m) => {
            return obj.IEEEAddress === m.IEEEAddress;
        });

        if (!objSwitch) {
            console.log("Switch is not in dongle_config.json");
            return;
        }

        if (parseInt(objSwitch.type) === Device.DOUBLE_SWITCH) {
            if (data.endPoint == Device.LEFT_EP_SWITCH &&
                data.status == Device.SWITCH_KEYDOWN) {

                this.turnOffAll(() => {

                });
                this.broadcast(JSON.stringify({
                    cmd: 'toall',
                    action: 'off'
                }));

            } else if (data.endPoint == Device.RIGHT_EP_SWITCH &&
                data.status == Device.SWITCH_KEYDOWN) {

                this.turnOnAll(() => {

                });
                this.broadcast(JSON.stringify({
                    cmd: 'toall',
                    action: 'on'
                }));

            }
        } else {
            console.log("switch type is unrecognized");
        }
    }
}