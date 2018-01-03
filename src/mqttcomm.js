"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Mqtt = require("mqtt");
var HOST = '139.219.184.44';
var PORT = '1884';
var CLIENT_ID = 'light-GW-';
var CODE = "server1234";
// mqtt client setting
var SETTINGS = {
    keepalive: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clientId: CLIENT_ID,
    username: 'client3',
    password: 'ruff5678'
};
var MqttComm = /** @class */ (function () {
    function MqttComm(objConfig) {
        console.log("mqttcomm init");
        this.username = objConfig.Servername;
        this.bOnline = false;
    }
    MqttComm.prototype.start = function () {
        var _this = this;
        this.client = Mqtt.connect(HOST + ":" + PORT, {
            keepalive: 1000,
            protocolId: "MQIsdp",
            protocolVersion: 3,
            clientId: CLIENT_ID + this.username,
            username: this.username,
            password: CODE,
        });
        this.client.on("close", function () {
            console.log("MQTT to server closed:" + HOST);
            _this.bOnline = false;
            setTimeout(function () {
                _this.start();
            }, 100000);
        });
        this.client.on("error", function (err) {
            console.log("MQTT server, error");
            console.log(err);
        });
        this.client.on("connect", function () {
            console.log("\nMQTT server Connected" + HOST + "\n");
            _this.bOnline = true;
        });
    };
    return MqttComm;
}());
exports.MqttComm = MqttComm;
