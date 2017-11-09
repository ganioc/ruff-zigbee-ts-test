/**
 * Dongle is physical Zigbee Dongle
 * One gateway will have multiple dongles attached
 */

import Events = require("events");

export class Dongle {
    static serialCounter: number = 1001;
    name: string; // user readable name
    private id: string; // get from getVersion ""
    serial: string;

    static readonly ID_LENGTH = 8;
    emitter: Events.EventEmitter;

    //deviceList: any[];  //

    constructor(public uart) {
        this.name = "";
        //this.id = "";
        this.emitter = new Events.EventEmitter();
        this.serial = (Dongle.serialCounter++).toString();

        console.log("Dongle:" + this.serial);

        this.uart.on('data', (data: Buffer) => {
            console.log("\n\n<<<===");
            if (this.ID) {
                console.log("Dongle RX: " + this.serial + " " + this.ID + " " + this.name);
            } else {
                console.log("Dongle RX: " + this.serial);
            }

            this.emitter.emit('data', data);
        });
    }

    checkStorage() {

    }

    checkUart() {

    }

    set ID(str: string) {
        this.id = str;
    }
    get ID(): string {
        return this.id;
    }
    setIDByVersion(major: string, install: string) {
        this.id = major.slice(2) + install.slice(2);
    }
    print() {
        console.log("\nDongle " + ": " + this.serial);
        console.log("Name:" + this.name);
        console.log("ID: " + this.ID);
    }
}