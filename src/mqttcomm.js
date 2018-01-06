"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Mqtt = require("mqtt");
var HOST = '139.219.184.44';
var PORT = '1884';
var CLIENT_ID = 'light-GW-';
var CODE = "server1234";
var TOPIC_COMMON_DL = 'light/gw-common-dl';
var TOPIC_COMMON_UL = 'light/gw-common-ul';
var TOPIC_DL = 'light/gw-dl';
var TOPIC_UL = 'light/gw-ul';
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
    function MqttComm(objConfig, storage, mana) {
        console.log("mqttcomm init");
        this.username = objConfig.Servername;
        this.bOnline = false;
        this.store = storage;
        this.manager = mana;
        console.log("username:" + this.username);
        console.log("code:" + CODE);
    }
    MqttComm.prototype.start = function () {
        var _this = this;
        console.log("host:" + HOST);
        console.log("port:" + PORT);
        this.counterClose = 0;
        this.bOnline = false;
        this.client = Mqtt.connect("mqtt://" + HOST + ":" + PORT, {
            keepalive: 1000,
            protocolId: "MQIsdp",
            protocolVersion: 3,
            clientId: CLIENT_ID + this.username,
            username: this.username,
            password: CODE,
        });
        this.client.on("close", function () {
            console.log("MQTT to server closed:" + HOST);
            _this.counterClose++;
            if (_this.counterClose > 1000) {
                setTimeout(function () {
                    // this.start();
                    console.log("error counter > 1000");
                    _this.counterClose = 0;
                }, 30000);
            }
        });
        this.client.on("error", function (err) {
            console.log("MQTT server, error");
            console.log(err);
        });
        this.client.on("connect", function () {
            console.log("\nMQTT server Connected" + HOST + "\n");
            _this.bOnline = true;
            _this.client.subscribe(TOPIC_COMMON_DL);
            _this.client.subscribe(TOPIC_DL);
        });
        this.client.on('message', function (topic, msg) {
            _this.bOnline = true;
            switch (topic) {
                case TOPIC_COMMON_DL:
                    console.log(TOPIC_COMMON_DL + ":" + msg.toString());
                    var obj = void 0;
                    obj = JSON.parse(msg.toString());
                    // on command
                    if (obj.type === "cmd" && obj.content === "allon") {
                        console.log("cmd allon");
                        _this.manager.turnOnAll(function () {
                            _this.report();
                        });
                    }
                    else if (obj.type === "cmd" && obj.content === "alloff") {
                        // off command
                        console.log("cmd alloff");
                        _this.manager.turnOffAll(function () {
                            _this.report();
                        });
                    }
                    else if (obj.type === "cmd" && obj.content === "test") {
                        console.log("cmd test received");
                    }
                    else {
                        console.log("unrecognized cmd:" + obj.type);
                        console.log(obj.content);
                    }
                    break;
                case TOPIC_DL:
                    console.log(TOPIC_DL + ":" + msg.toString());
                    var obj1 = void 0;
                    try {
                        obj1 = JSON.parse(msg.toString());
                    }
                    catch (e) {
                        console.log(e);
                        break;
                    }
                    break;
                default:
                    console.log("Unrecognized topic:" + topic);
                    break;
            }
        });
    };
    MqttComm.prototype.report = function () {
        if (this.bOnline === false) {
            console.log("Mqtt cant report, not online");
            return;
        }
        console.log(this.username + ": report to server");
        // get current light status
        this.client.publish(TOPIC_UL, JSON.stringify({
            type: "report",
            content: this.store.getDeviceList(),
            timestamp: new Date().getTime(),
            name: this.username
        }));
    };
    MqttComm.prototype.close = function () {
        this.client.close();
    };
    return MqttComm;
}());
exports.MqttComm = MqttComm;
