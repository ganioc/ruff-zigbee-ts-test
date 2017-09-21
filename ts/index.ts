declare var $: any;

import { Dongle } from './dongle';
import { DongleBundle, DongleData, ConfigJSON } from './donglebundle';
import { ZigbeeUtils, ProtocolSegment } from './zigbee_utils';
import { Interpreter, MessageAnnounce, MessageAttributeReport, MessageLeaveIndication, MessageVersionList } from './interpreter';
import { DeviceManager } from './devicemanager';
import { DeviceStorage } from './storage';
import { UdpServer } from './udpserver';
import _ = require("underscore");

let DONGLE_CONFIG = require("../dongle_config.json");

let objConfig: ConfigJSON = <ConfigJSON>DONGLE_CONFIG;

let storage = new DeviceStorage();
let manager = new DeviceManager(storage);


let uart0 = $('#zuart0'); // /dev/ttyUSB0
let uart1 = $('#zuart1'); // /dev/ttyUSB1

let dongleBundle: DongleBundle = new DongleBundle([uart0, uart1]);

let udpserver = new UdpServer(storage, manager, dongleBundle);

let zigbee = new ZigbeeUtils(); // zigbee cmds api
let decode = new Interpreter();

$.ready(function (error) {
    if (error) {
        console.log(error);
        return;
    } else {
        console.log('\nno error when start');
    }

    console.log("\nStart of Zigbee GW");

    dongleBundle.checkLocalFiles(storage);

    dongleBundle.emitter.on("data", (dData: DongleData) => {
        //console.log(dData.dongle.serial);
        //console.log(dData.data);

        let dataProcessed: ProtocolSegment;
        dataProcessed = zigbee.unpack(dData.data);

        decode.handleMessage(dData.dongle.serial, dataProcessed);

    });



    // handle events
    decode.emitter.on('handleDeviceAnnounce', function (data: MessageAnnounce) {
        console.log("\n<<<< handleDeviceAnnounce");
        console.log(data);
        // only way to add new device
        let obj = manager.findDeviceLongAddress(data.IEEEAddress);
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
    decode.emitter.on('handleVersionList', function (data: MessageVersionList) {
        console.log("\n<<<< handleVersionList");
        console.log(data);

        // update bundle information here
        // according to dongleId
        let dongle = dongleBundle.getDongleBySerial(data.dongleSerial);

        if (dongle) {
            console.log("Found dongle :" + dongle.serial);
            //change dongle ID, change dongle name
            dongle.ID = data.majorVersionNumber.slice(2) + data.installerVersionNumber.slice(2);

            console.log("Dongle ID:" + dongle.ID);

            let dev = _.find(objConfig.DeviceList, (m) => {
                return m.id_hex === data.majorVersionNumber.slice(2) + data.installerVersionNumber.slice(2);
            })
            if (dev) {
                dongle.name = dev.name;
            } else {
                throw new Error("Unmatched dongle id in dongle_config.json file");
            }

        } else {
            console.log("Unfound dongleId:" + data.dongleSerial);
        }


    });
    decode.emitter.on('handleDefaultResponse', function () {

    });

    decode.emitter.on('handleAttributeReport', function (data: MessageAttributeReport) {
        //place to set the device is online
        // change the device type according to clusterID:0x0005
        manager.updateLightDeviceType(data);

        // place to set the correct state of the device
        manager.updateOnOffState(data);

        // control light according to switch action
        let dongle = dongleBundle.getDongleBySerial(data.dongleSerial);
        if (dongle) {
            manager.updateControlAction(dongle.uart, data);
        } else {
            console.log("handleAttributeReport, can not find dongle:" + data.dongleSerial);
        }


    });
    decode.emitter.on('handleReadAttributeResponse', function (data) {
        manager.updateOnOffState(data);

    });
    decode.emitter.on('handleNetworkJoinedOrFormed', function (data) {

    });

    decode.emitter.on('handleLeaveIndication', function (data: MessageLeaveIndication) {
        console.log("\n<<<< handle Leave");
        console.log(data);
        var obj = manager.findDeviceLongAddress(data.IEEEAddress);
        if (obj) {
            manager.leaveDevice(obj);
        } else {
            console.log("Unrecognized device leave:" + data.IEEEAddress);
        }
    });

    dongleBundle.reset();

    udpserver.start({
        id: "",
        port: ""
    });


    setTimeout(() => {
        console.log("Into main()");

        dongleBundle.checkDongles(zigbee);

        setTimeout(() => {
            dongleBundle.checkDongleNames(objConfig);
            dongleBundle.print();

            dongleBundle.startNetwork();
        }, 3000);
    }, 5000);



});
function main() {


}
$.end(function () {

});


