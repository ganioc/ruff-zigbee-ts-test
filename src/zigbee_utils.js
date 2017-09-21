"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ZigbeeUtils = (function () {
    function ZigbeeUtils() {
    }
    // mask message and push into buffer
    ZigbeeUtils.prototype.stuff = function (buffer) {
        var packet = [];
        for (var i = 0; i < buffer.length; i++) {
            if (buffer[i] < ZigbeeUtils.MASK) {
                packet.push(ZigbeeUtils.ESC);
                packet.push(buffer[i] ^ ZigbeeUtils.MASK);
            }
            else {
                packet.push(buffer[i]);
            }
        }
        return Buffer.from(packet);
    };
    ZigbeeUtils.prototype.unstuff = function (buffer) {
        var packet = [];
        for (var i = 0; i < buffer.length; i++) {
            if (buffer[i] === ZigbeeUtils.ESC) {
                i++;
                packet.push(buffer[i] ^ ZigbeeUtils.MASK);
            }
            else {
                packet.push(buffer[i]);
            }
        }
        console.log("\n\n*** unstuff");
        //console.log(packet);
        //console.log("*\n");
        return Buffer.from(packet);
    };
    ZigbeeUtils.prototype.formatToUInt16BE = function (value) {
        var valueBuf = new Buffer(2);
        valueBuf.writeUInt16BE(value, 0);
        //console.log('---===format16BE: ' + valueBuf.toString('hex'));
        return valueBuf;
    };
    ZigbeeUtils.prototype.crcCaculate = function (msgType, msgLen, msg) {
        //var crcResult = msgType ^ msgLen;
        var crcResult = 0x00;
        crcResult ^= (msgType & 0xff00) >> 8;
        crcResult ^= (msgType & 0x00ff);
        crcResult ^= (msgLen & 0xff00) >> 8;
        crcResult ^= (msgLen & 0x00ff);
        for (var i = 0; i < msg.length; i++) {
            crcResult ^= msg[i];
        }
        return Buffer.from([crcResult]);
    };
    ZigbeeUtils.prototype.sliceData = function (data) {
        var slicedData = [];
        var strData = data.toString('hex');
        for (var i = 0; i < strData.length; i += 2) {
            slicedData.push(strData.slice(i, i + 2));
        }
        console.log("*** slicedata");
        //console.log(slicedData);
        //console.log("*\n");
        return slicedData;
    };
    ZigbeeUtils.prototype.checkCheckSum = function (message) {
        var xorResult = 0;
        console.log("*** checkCheckSum");
        for (var i = 0; i < message.length; i++) {
            //console.log(i + ':' + message[i].toString());
            xorResult ^= Number('0x' + message[i]);
        }
        //console.log("\nxorResult = " + xorResult);
        //console.log('*\n');
        return xorResult === 0;
    };
    ZigbeeUtils.prototype.parseMessage = function (msg) {
        var protocolContent;
        protocolContent = {
            valid: false,
            MsgType: '',
            MsgLength: 0,
            MsgContent: []
        };
        if (msg[0] === '01' && msg[msg.length - 1] === '03') {
            protocolContent.valid = this.checkCheckSum(msg.slice(1, -1));
            protocolContent.MsgType = '0x' + msg[1] + msg[2];
            protocolContent.MsgLength = Number('0x' + msg[3] + msg[4]);
            protocolContent.MsgContent = msg.slice(6, -1);
        }
        else {
            console.log('it is not a valid frame!');
        }
        return protocolContent;
    };
    ZigbeeUtils.prototype.pack = function (msgType, msg) {
        var packet = new Buffer(1);
        packet.writeUInt8(ZigbeeUtils.START, 0);
        packet = Buffer.concat([packet, this.stuff(this.formatToUInt16BE(msgType))]);
        packet = Buffer.concat([packet, this.stuff(this.formatToUInt16BE(msg.length))]);
        packet = Buffer.concat([packet, this.stuff(this.crcCaculate(msgType, msg.length, msg))]);
        packet = Buffer.concat([packet, this.stuff(msg)]);
        packet = Buffer.concat([packet, Buffer.from([ZigbeeUtils.STOP])]);
        //console.log('---===packet: ' + packet.toString('hex'));
        return packet;
    };
    ZigbeeUtils.prototype.unpack = function (data) {
        var unstuffedData = this.unstuff(data);
        var slicedData = this.sliceData(unstuffedData);
        var protocolContent = this.parseMessage(slicedData);
        console.log("Unpacked data is:");
        console.log(protocolContent);
        return protocolContent;
    };
    ZigbeeUtils.prototype._writeCmd = function (uart, cmdType, msg) {
        var cmd = this.pack(cmdType, msg);
        uart.write(cmd);
    };
    ZigbeeUtils.prototype.reset = function (uart) {
        console.log('zigbee reset');
        var msg = new Buffer(0);
        this._writeCmd(uart, 0x11, msg);
    };
    ZigbeeUtils.prototype.getVersion = function (uart) {
        console.log('request to get version');
        var msg = new Buffer(0);
        this._writeCmd(uart, 0x10, msg);
    };
    ZigbeeUtils.prototype.setExtendedPANID = function (uart) {
        console.log('set extended PANID');
        var msg = new Buffer([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        this._writeCmd(uart, 0x20, msg);
    };
    ZigbeeUtils.prototype.setChannelMask = function (uart) {
        console.log('set channel mask');
        // TODO channel mask
        var msg = new Buffer([0x00, 0x00, 0x00, 0x10]);
        this._writeCmd(uart, 0x21, msg);
    };
    ZigbeeUtils.prototype.setSecurityStateAndKey = function (uart) {
        console.log('set security state and key');
        var msg = new Buffer([
            0x03,
            0x00, 0x01,
            0x5a, 0x69, 0x67, 0x42, 0x65, 0x65, 0x41, 0x6c,
            0x6c, 0x69, 0x61, 0x6e, 0x63, 0x65, 0x30, 0x39
        ]);
        this._writeCmd(uart, 0x22, msg);
    };
    ZigbeeUtils.prototype.setDeviceType = function (uart) {
        console.log('set device type');
        var msg = new Buffer([0x00]);
        this._writeCmd(uart, 0x23, msg);
    };
    ZigbeeUtils.prototype.startNetwork = function (uart) {
        console.log('start network');
        var msg = new Buffer(0);
        this._writeCmd(uart, 0x24, msg);
    };
    ZigbeeUtils.prototype.startNetworkScan = function (uart) {
        console.log('start network scan');
        var msg = new Buffer(0);
        this._writeCmd(uart, 0x25, msg);
    };
    ZigbeeUtils.prototype.permitJoiningRequest = function (uart) {
        console.log('permit joining request');
        //var msg = new Buffer([0x00, 0x00, 0xff, 0x00]);
        // Changed by Yang, 2017.6
        var msg = new Buffer([0xff, 0xfc, 0xfd, 0x00]);
        this._writeCmd(uart, 0x49, msg);
    };
    ZigbeeUtils.prototype.IEEEAddressRequest = function (shortAddr) {
        console.log('IEEE address request');
        var msg = new Buffer([]);
        // Need implementation. Yang?
    };
    ZigbeeUtils.prototype.checkLightStatus = function (uart, shortAddress, EP) {
        console.log('ask light status');
        // address mode -- short addr -- sep -- dep -- clusterID (16) -- dir -- manu spec -- manu ID (16) -- #attri -- addriID (16)
        var msg = new Buffer([0x02, 0xff, 0xff, 0x01, EP, 0x00, 0x06, 0x00, 0x00, 0x00, 0x11, 0x01, 0x00, 0x00]);
        msg.writeUInt16BE(shortAddress, 1);
        this._writeCmd(uart, 0x0100, msg);
    };
    // added by XinyangLi
    ZigbeeUtils.prototype.custTurnLightOn = function (uart, shortAddress, endPoint) {
        console.log('\nturn light on, end point sent: ' + endPoint);
        // TODO short addressES
        if (!endPoint) {
            endPoint = 0x2;
        }
        var msg = new Buffer([0x2, 0xff, 0xff, 0x1, endPoint, 0x1]);
        msg.writeUInt16BE(shortAddress, 1);
        this._writeCmd(uart, 0x92, msg);
    };
    ZigbeeUtils.prototype.custTurnLightOff = function (uart, shortAddress, endPoint) {
        console.log('turn light off');
        console.log('turn light off, end point sent: ' + endPoint);
        // TODO short addressES
        if (!endPoint) {
            endPoint = 0x2;
        }
        var msg = new Buffer([0x2, 0xff, 0xff, 0x1, endPoint, 0x0]);
        msg.writeUInt16BE(shortAddress, 1);
        this._writeCmd(uart, 0x92, msg);
    };
    ZigbeeUtils.prototype.custToggleLight = function (uart, shortAddress, endPoint) {
        console.log('toggle light');
        console.log('--- short address: ' + shortAddress);
        var msg = new Buffer([0x2, 0xff, 0xff, 0x1, 0x2, 0x2]);
        msg.writeUInt16BE(shortAddress, 1);
        this._writeCmd(uart, 0x92, msg);
    };
    ZigbeeUtils.START = 0x1;
    ZigbeeUtils.STOP = 0x3;
    ZigbeeUtils.ESC = 0x2;
    ZigbeeUtils.MASK = 0x10;
    return ZigbeeUtils;
}());
exports.ZigbeeUtils = ZigbeeUtils;
