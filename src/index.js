"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var donglebundle_1 = require("./donglebundle");
var zigbee_utils_1 = require("./zigbee_utils");
var interpreter_1 = require("./interpreter");
var devicemanager_1 = require("./devicemanager");
var storage_1 = require("./storage");
var udpserver_1 = require("./udpserver");
var _ = require("underscore");
var timers_1 = require("timers");
var DONGLE_CONFIG = require("../dongle_config_gw3.json");
var objConfig = DONGLE_CONFIG;
var storage = new storage_1.DeviceStorage();
var uart0 = $('#zuart0'); // /dev/ttyUSB0
var uart1 = $('#zuart1'); // /dev/ttyUSB1
var dongleBundle = new donglebundle_1.DongleBundle([uart0, uart1]);
var manager = new devicemanager_1.DeviceManager(storage, dongleBundle);
var udpserver = new udpserver_1.UdpServer(storage, manager, dongleBundle);
var zigbee = new zigbee_utils_1.ZigbeeUtils(); // zigbee cmds api
var decode = new interpreter_1.Interpreter();
$.ready(function (error) {
    if (error) {
        console.log(error);
        return;
    }
    else {
        console.log('\nno error when start');
    }
    console.log("\nStart of Zigbee GW");
    dongleBundle.checkLocalFiles(storage);
    dongleBundle.emitter.on("data", function (dData) {
        //console.log(dData.dongle.serial);
        //console.log(dData.data);
        var dataProcessed;
        dataProcessed = zigbee.unpack(dData.data);
        decode.handleMessage(dData.dongle.serial, dataProcessed);
    });
    // handle events
    decode.emitter.on('handleDeviceAnnounce', function (data) {
        console.log("\n<<<< handleDeviceAnnounce");
        console.log(data);
        // only way to add new device
        var obj = manager.findDeviceLongAddress(data.IEEEAddress);
        if (obj) {
            // already exists, update shortaddress only
            manager.announceDevice(obj, data.shortAddress);
        }
        else {
            // create new device
            console.log("add new device: " + dongleBundle.getDongleBySerial(data.dongleSerial).ID);
            manager.newDevice(data, dongleBundle.getDongleBySerial(data.dongleSerial).ID);
        }
        // place to make sure the device is online
    });
    decode.emitter.on('handleStatusResponse', function (data) {
    });
    decode.emitter.on('handleLogMessage', function (data) {
    });
    decode.emitter.on('handleNodeClusterAttributeList', function () {
    });
    decode.emitter.on('handleNodeCommandIDList', function () {
    });
    decode.emitter.on('handleNonFactoryNewReset', function () {
    });
    decode.emitter.on('handleVersionList', function (data) {
        console.log("\n<<<< handleVersionList");
        console.log(data);
        // update bundle information here
        // according to dongleId
        var dongle = dongleBundle.getDongleBySerial(data.dongleSerial);
        if (dongle) {
            console.log("Found dongle :" + dongle.serial);
            //change dongle ID, change dongle name
            dongle.ID = data.majorVersionNumber.slice(2) + data.installerVersionNumber.slice(2);
            console.log("Dongle ID:" + dongle.ID);
            var dev = _.find(objConfig.DeviceList, function (m) {
                return m.id_hex === data.majorVersionNumber.slice(2) + data.installerVersionNumber.slice(2);
            });
            if (dev) {
                dongle.name = dev.name;
            }
            else {
                throw new Error("Unmatched dongle id in dongle_config.json file");
            }
        }
        else {
            console.log("Unfound dongleId:" + data.dongleSerial);
        }
    });
    decode.emitter.on('handleDefaultResponse', function () {
    });
    decode.emitter.on('handleAttributeReport', function (data) {
        //place to set the device is online
        // change the device type according to clusterID:0x0005
        manager.updateLightDeviceType(data);
        // place to set the correct state of the device
        manager.updateOnOffState(data);
        manager.updateControlFromSwitch(data, objConfig);
        // control light according to switch action
        // let dongle = dongleBundle.getDongleBySerial(data.dongleSerial);
        // if (dongle) {
        //     manager.updateControlAction(dongle.uart, data);
        // } else {
        //     console.log("handleAttributeReport, can not find dongle:" + data.dongleSerial);
        // }
    });
    decode.emitter.on('handleReadAttributeResponse', function (data) {
        manager.updateOnOffState(data);
    });
    decode.emitter.on('handleNetworkJoinedOrFormed', function (data) {
    });
    decode.emitter.on('handleLeaveIndication', function (data) {
        console.log("\n<<<< handle Leave");
        console.log(data);
        var obj = manager.findDeviceLongAddress(data.IEEEAddress);
        if (obj) {
            manager.leaveDevice(obj);
        }
        else {
            console.log("Unrecognized device leave:" + data.IEEEAddress);
        }
    });
    dongleBundle.reset();
    udpserver.start({
        id: objConfig.Servername,
        port: ""
    });
    timers_1.setTimeout(function () {
        console.log("Into main()");
        dongleBundle.checkDongles(zigbee);
        timers_1.setTimeout(function () {
            dongleBundle.checkDongleNames(objConfig);
            dongleBundle.print();
            dongleBundle.startNetwork();
        }, 3000);
        timers_1.setTimeout(function () {
            main();
        }, 10000);
    }, 5000);
});
function main() {
    // send check status command
    timers_1.setTimeout(function () {
        console.log("Periodically checkstatus()");
        manager.checkstatusAllLights();
    }, 300000);
}
$.end(function () {
});
