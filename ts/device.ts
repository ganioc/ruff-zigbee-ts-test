
export interface DeviceOptions {
    shortAddress: string,
    IEEEAddress: string,
    online: boolean,
    onlineLastUpdate: number,
    type: number,
    deviceID: string,
    dongleID: string,
}

export class Device {
    // on off state 
    static readonly OFF = 0;
    static readonly ON = 1;

    // device type
    static readonly SINGLE_SWITCH = 0x10;
    static readonly DOUBLE_SWITCH = 0x11;
    static readonly SINGLE_SOCKET = 0x20;
    static readonly DOUBLE_SOCKET = 0x21;
    static readonly UNKNOWN = 0x12;
    //
    static readonly EMPTY_NAME = 'emptyName';
    // end point definition
    static readonly EP_SWITCH = '0x01';
    static readonly LEFT_EP_SWITCH = '0x01';
    static readonly RIGHT_EP_SWITCH = '0x02';
    static readonly EP_SOCKET = '0x02';
    static readonly LEFT_EP_SOCKET = '0x02';
    static readonly RIGHT_EP_SOCKET = '0x03';
    static readonly SWITCH_KEYDOWN = '0x00';
    static readonly SWITCH_KEYUP = '0x01';

    shortAddress: string;
    // IEEEAddress is the most important identification
    // No matter shortaddress is changed or not
    IEEEAddress: string;
    //state: number;
    //leftState: number;
    //rightState: number;
    type: number;
    online: boolean;
    onlineLastUpdate: number;
    // this is the device name, or ID
    deviceID: string;
    dongleID: string;

    static ep2String(ep: string): string {
        if (ep === Device.LEFT_EP_SOCKET) {
            return 'left';
        }
        else if (ep === Device.RIGHT_EP_SOCKET) {
            return 'right';
        }
        else {
            return '';
        }
    }
    constructor(options: DeviceOptions) {
        this.shortAddress = options.shortAddress || '0x0000';
        this.IEEEAddress = options.IEEEAddress || '0x0000000000000000';
        this.type = options.type || Device.UNKNOWN;
        this.online = options.online || false;
        this.onlineLastUpdate = options.onlineLastUpdate || new Date().getTime();
        this.deviceID = options.deviceID || Device.EMPTY_NAME;
        this.dongleID = options.dongleID || "00000000";
    }
}

export class SingleSwitchDevice extends Device {

    constructor(options) {
        super(options);
        this.type = Device.SINGLE_SWITCH;
    }


}
export class DoubleSwitchDevice extends Device {
    constructor(options) {
        super(options);
        this.type = Device.DOUBLE_SWITCH;
    }
}
export class SingleSocketDevice extends Device {
    // light is on or off
    state: number;  // 0 or 1
    stateLastUpdate: number; // in ms Date().getTime()

    constructor(options) {
        super(options);
        this.type = Device.SINGLE_SOCKET;
        this.state = options.state || Device.OFF;
        this.stateLastUpdate = 0; // if it's not updated, it's zero
    }
}
export class DoubleSocketDevice extends Device {
    leftState: number;
    leftStateLastUpdate: number;

    rightState: number;
    rightStateLastUpdate: number;

    constructor(options) {
        super(options);
        this.type = Device.DOUBLE_SOCKET;
        this.leftState = options.leftState || Device.OFF;
        this.rightState = options.rightState || Device.OFF;
        this.leftStateLastUpdate = 0;
        this.rightStateLastUpdate = 0;
    }
}