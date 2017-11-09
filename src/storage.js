"use strict";
/**
 * DeviceList local storage , persistent storage
 */
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var DeviceStorage = /** @class */ (function () {
    function DeviceStorage() {
        this.deviceList = [];
        this.relationList = [];
    }
    DeviceStorage.prototype.getDeviceList = function () {
        return this.deviceList;
    };
    DeviceStorage.prototype.getRelationList = function () {
        return this.relationList;
    };
    DeviceStorage.prototype.getDeviceListItem = function (index) {
        if (index >= 0 && index < this.deviceList.length) {
            return this.deviceList[index];
        }
        return null;
    };
    DeviceStorage.prototype.getRelationListItem = function (index) {
        if (index >= 0 && index < this.relationList.length) {
            return this.relationList[index];
        }
        return null;
    };
    DeviceStorage.prototype.createFile = function (fileName, content) {
        console.log("Create file " + fileName);
        fs.writeFileSync(fileName, content);
    };
    DeviceStorage.prototype.checkFileDeviceList = function () {
        console.log('check device list file');
        if (fs.existsSync(DeviceStorage.DEVICE_LIST)) {
            console.log("exist:" + DeviceStorage.DEVICE_LIST);
            var data = fs.readFileSync(DeviceStorage.DEVICE_LIST);
            console.log('--- check device file data: ' + data);
            try {
                var devices = JSON.parse(data.toString()).deviceList;
            }
            catch (e) {
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
        }
        else {
            console.log('Create new devices.json file');
            this.createFile(DeviceStorage.DEVICE_LIST, '{"deviceList":[]}');
        }
    };
    DeviceStorage.prototype.checkFileRelationList = function () {
        console.log('check relation list file');
        if (fs.existsSync(DeviceStorage.RELATION_LIST)) {
            console.log('exists:' + DeviceStorage.RELATION_LIST);
            var data = fs.readFileSync(DeviceStorage.RELATION_LIST);
            // device list
            console.log('--- check relation file data: ' + data);
            try {
                var relations = JSON.parse(data.toString()).relationList;
            }
            catch (e) {
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
        }
        else {
            console.log('Create new relations.json file');
            this.createFile(DeviceStorage.RELATION_LIST, '{"relationList":[]}');
        }
    };
    DeviceStorage.prototype.writeList = function (listName) {
        var toSaveObj;
        var fileName;
        console.log('===== write file triggered');
        if (listName == 'deviceList') {
            toSaveObj = {
                deviceList: this.deviceList
            };
            fileName = DeviceStorage.DEVICE_LIST;
        }
        else if (listName == 'relationList') {
            toSaveObj = {
                relationList: this.relationList
            };
            fileName = DeviceStorage.RELATION_LIST;
        }
        else {
            console.log('wrong list name for writeList()');
            return;
        }
        console.log('---' + listName + ' List saved!');
        fs.writeFileSync(fileName, JSON.stringify(toSaveObj));
    };
    DeviceStorage.prototype.clearDeviceList = function () {
        this.deviceList = [];
    };
    DeviceStorage.prototype.clearRelationList = function () {
        this.relationList = [];
    };
    DeviceStorage.DEVICE_LIST = '/home/root/devices.json';
    DeviceStorage.RELATION_LIST = '/home/root/relations.json';
    return DeviceStorage;
}());
exports.DeviceStorage = DeviceStorage;
