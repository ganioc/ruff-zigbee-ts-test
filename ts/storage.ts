/**
 * DeviceList local storage , persistent storage
 */

import fs = require('fs');
import { Device } from './device';
import { Relation } from './relation';

export class DeviceStorage {

    static readonly DEVICE_LIST = '/home/root/devices.json';
    static readonly RELATION_LIST = '/home/root/relations.json';

    deviceList: Device[];
    relationList: Relation[];

    constructor() {
        this.deviceList = [];
        this.relationList = [];
    }

    getDeviceList(): Device[] {
        return this.deviceList;
    }
    getRelationList(): Relation[] {
        return this.relationList;
    }
    getDeviceListItem(index: number): Device {
        if (index >= 0 && index < this.deviceList.length) {
            return this.deviceList[index];
        }

        return null;
    }
    getRelationListItem(index: number): Relation {
        if (index >= 0 && index < this.relationList.length) {
            return this.relationList[index];
        }
        return null;
    }

    private createFile(fileName: string, content: string): void {
        console.log("Create file " + fileName);

        fs.writeFileSync(fileName, content);
    }

    checkFileDeviceList(): void {
        console.log('check device list file');

        if (fs.existsSync(DeviceStorage.DEVICE_LIST)) {
            console.log("exist:" + DeviceStorage.DEVICE_LIST);

            var data = fs.readFileSync(DeviceStorage.DEVICE_LIST);

            console.log('--- check device file data: ' + data);

            try {
                var devices = JSON.parse(data.toString()).deviceList;
            } catch (e) {
                console.log(e);
                console.log('Create new devices.json file');
                this.createFile(DeviceStorage.DEVICE_LIST, '{"deviceList":[]}');
                return;
            }
            console.log('--- check file parse data: ' + devices);

            if (devices) {
                console.log('--- restore device list: ' + DeviceStorage.DEVICE_LIST);

                for (var i in devices) {
                    this.deviceList.push(devices[i]);
                }
            }

            console.log("After file reading\n");
        } else {
            console.log('Create new devices.json file');
            this.createFile(DeviceStorage.DEVICE_LIST, '{"deviceList":[]}');
        }
    }
    checkFileRelationList(): void {
        console.log('check relation list file');

        if (fs.existsSync(DeviceStorage.RELATION_LIST)) {
            console.log('exists:' + DeviceStorage.RELATION_LIST);
            var data = fs.readFileSync(DeviceStorage.RELATION_LIST);
            // device list
            console.log('--- check relation file data: ' + data);

            try {
                var relations = JSON.parse(data.toString()).relationList;
            } catch (e) {
                console.log(e);
                console.log('Create new relations.json file');
                this.createFile(DeviceStorage.RELATION_LIST, '{"relationList":[]}');
                return;
            }
            console.log('--- check file parse data: ' + relations);

            if (relations) {
                console.log('--- restore relation list: ' + this.relationList);

                for (var i in relations) {
                    this.relationList.push(relations[i]);
                }
            }

            console.log("After file reading\n");

        } else {
            console.log('Create new relations.json file');
            this.createFile(DeviceStorage.RELATION_LIST, '{"relationList":[]}');
        }
    }

    writeList(listName: string): void {
        var toSaveObj;
        let fileName;

        console.log('===== write file triggered');

        if (listName == 'deviceList') {
            toSaveObj = {
                deviceList: this.deviceList
            };
            fileName = DeviceStorage.DEVICE_LIST;
        } else if (listName == 'relationList') {
            toSaveObj = {
                relationList: this.relationList
            };
            fileName = DeviceStorage.RELATION_LIST;

        } else {
            console.log('wrong list name for writeList()');
            return;
        }

        console.log('---' + listName + ' List saved!');

        fs.writeFileSync(fileName, JSON.stringify(toSaveObj));
    }

    clearDeviceList() {
        this.deviceList = [];
    }
    clearRelationList() {
        this.relationList = [];
    }
}



