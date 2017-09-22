import { Dongle } from './dongle';
import { ProtocolSegment } from './zigbee_utils';
import Events = require("events");
import _ = require("underscore");
import { Device } from './device';
import { DeviceStorage } from './storage';
import { ZigbeeUtils } from './zigbee_utils';
import { YAsync } from './yasync';

let zigbee = new ZigbeeUtils();

export interface DongleData {
    data: Buffer;
    dongle: Dongle;
}

export interface deviceJSON {
    id: string,
    id_hex: string,
    name: string
}
export interface usbJSON {
    path: string
}
// export interface deviceListJSON {
//     DeviceList: 
// }
// export interface usbListJSON {
//     USBList: usbJSON[];
// }
export interface switchJSON {
    "IEEEAddress": string,
    "type": string
}
export interface ConfigJSON {
    DeviceList: deviceJSON[];
    usbListJSON: usbJSON[];
    switchListJSON: switchJSON[];
}
export class DongleBundle {
    //uarts: any[];
    dongles: Dongle[];

    emitter: Events.EventEmitter;

    constructor(uarts: any[]) {
        this.emitter = new Events.EventEmitter();

        this.dongles = [];

        uarts.forEach((m) => {
            //this.uarts.push(m);
            this.dongles.push(new Dongle(m));
        });
        console.log(this.dongles.length + " dongles");

        this.dongles.forEach((m: Dongle) => {
            m.emitter.on('data', (data: Buffer) => {
                this.emitter.emit('data', { data: data, dongle: m });
            });
        });

    }
    getDongleById(id: string): Dongle {
        return _.find(this.dongles, (m) => {
            return id === m.ID;
        });
    }
    getDongleBySerial(serial: string): Dongle {
        return _.find(this.dongles, (m) => {
            return serial === m.serial;
        });
    }
    checkLocalFiles(storage: DeviceStorage) {
        storage.checkFileDeviceList();
        storage.checkFileRelationList();
    }
    checkDongles(zigbee: ZigbeeUtils) {
        let lst: any[] = [];
        let i: number = 1;

        this.dongles.forEach((m) => {
            console.log("check usb dongle");
            //console.log(m);
            lst.push(function (callback) {
                setTimeout(function () {
                    zigbee.getVersion(m.uart);
                    callback(null, i++);
                }, 100);

            });
        });
        YAsync.series(lst, function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Finished checkDongles");
                console.log(data);
            }
        });
    }
    checkDongleNames(objLst: ConfigJSON) {
        this.dongles.forEach((m) => {
            console.log("\nCheck dongle:")
            //console.log(m);

            let d = _.find(objLst.DeviceList, function (n) {
                return n.id_hex === m.ID;
            })
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
    }
    dongleInfo(): object {
        let str = [];
        this.dongles.forEach((m) => {
            str.push({
                ID: m.ID,
                name: m.name,
                serial: m.serial
            });
        });

        return str;
    }
    print() {
        console.log("\n================================");
        console.log("Print dongleBundle");
        let i = 1;
        this.dongles.forEach((m) => {
            console.log("\nNo " + i++);
            m.print();
            console.log("");
        });
        console.log("==================================\n");
    }

    reset() {
        let lst: any[] = [];
        let i: number = 1;

        this.dongles.forEach((m) => {
            console.log("reset usb dongle");
            //console.log(m);
            lst.push(function (callback) {
                setTimeout(function () {
                    zigbee.reset(m.uart);
                    callback(null, i++);
                }, 100);

            });
        });
        YAsync.series(lst, function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Finished reset");
                console.log(data);

            }
        });
    }
    startNetwork() {
        let lst: any[] = [];
        let i: number = 1;

        this.dongles.forEach((m) => {
            console.log("reset usb dongle");
            //console.log(m);
            lst.push(function (callback) {
                setTimeout(function () {
                    zigbee.startNetwork(m.uart);
                    callback(null, i++);
                }, 100);
            });
        });
        YAsync.series(lst, function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Finished startNetwork");
                console.log(data);

            }
        });

    }

}