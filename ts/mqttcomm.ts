import * as Mqtt from "mqtt";
import { ConfigJSON } from './donglebundle';
import { triggerAsyncId } from "async_hooks";
import { DeviceStorage } from './storage';
import { DeviceManager } from './devicemanager';

var HOST = '139.219.184.44';
var PORT = '1884';
var CLIENT_ID = 'light-GW-';
const CODE = "server1234";

var TOPIC_COMMON_DL = 'light/gw-common-dl';
var TOPIC_COMMON_UL = 'light/gw-common-ul';
var TOPIC_DL = 'light/gw-dl';
var TOPIC_UL = 'light/gw-ul';

interface IfMsg {
    type: string;
    content: string;
    timestamp: number;
}

// mqtt client setting
var SETTINGS = {
    keepalive: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clientId: CLIENT_ID,
    username: 'client3',
    password: 'ruff5678'
};


export class MqttComm {
    public client;
    public bOnline: boolean;
    private username: string;
    private manager: DeviceManager;
    private store: DeviceStorage;
    private counterClose: number;


    constructor(objConfig: ConfigJSON, storage: DeviceStorage, mana: DeviceManager) {
        console.log("mqttcomm init");
        this.username = objConfig.Servername;
        this.bOnline = false;
        this.store = storage;
        this.manager = mana;
        console.log("username:" + this.username);
        console.log("code:" + CODE);
    }
    public start() {
        console.log("host:" + HOST);
        console.log("port:" + PORT);
        this.counterClose = 0;
        this.bOnline = false;

        this.client = Mqtt.connect(
            "mqtt://" + HOST + ":" + PORT,
            {
                keepalive: 1000,
                protocolId: "MQIsdp",
                protocolVersion: 3,
                clientId: CLIENT_ID + this.username,
                username: this.username,
                password: CODE,
            },
        );
        this.client.on("close", () => {
            console.log("MQTT to server closed:" + HOST);

            this.counterClose++;

            if (this.counterClose > 200) {
                this.start();

            }

        });
        this.client.on("error", (err) => {
            console.log("MQTT server, error");
            console.log(err);

        });
        this.client.on("connect", () => {
            console.log("\nMQTT server Connected" + HOST + "\n");
            this.bOnline = true;

            this.client.subscribe(TOPIC_COMMON_DL);
            this.client.subscribe(TOPIC_DL);
        });
        this.client.on('message', (topic, msg) => {

            this.bOnline = true;

            switch (topic) {
                case TOPIC_COMMON_DL:
                    console.log(TOPIC_COMMON_DL + ":" + msg.toString());
                    let obj: IfMsg;

                    obj = JSON.parse(msg.toString());

                    // on command
                    if (obj.type === "cmd" && obj.content === "allon") {
                        console.log("cmd allon");
                        this.manager.turnOnAll(() => {
                            this.report();
                        });
                    } else if (obj.type === "cmd" && obj.content === "alloff") {
                        // off command
                        console.log("cmd alloff");
                        this.manager.turnOffAll(() => {
                            this.report();
                        });
                    } else if (obj.type === "cmd" && obj.content === "test") {
                        console.log("cmd test received");
                    } else {
                        console.log("unrecognized cmd:" + obj.type);
                        console.log(obj.content);
                    }

                    break;
                case TOPIC_DL:
                    console.log(TOPIC_DL + ":" + msg.toString());
                    let obj1: IfMsg;

                    try {
                        obj1 = JSON.parse(msg.toString());
                    } catch (e) {
                        console.log(e);
                        break;
                    }

                    break;
                default:
                    console.log("Unrecognized topic:" + topic);
                    break;
            }
        });
    }
    public report() {
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

    }
    public close() {
        this.client.close();
    }
}
