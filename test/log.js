var doubleswitchAttributeReport1 = [{

    msgType: 'Attribute Report',
    sequenceNumber: '0x50',
    shortAddress: '0x54ce',
    endPoint: '0x01',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 52752,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x01'
}, {
    msgType: 'Attribute Report',
    sequenceNumber: '0x50',
    shortAddress: '0x54ce',
    endPoint: '0x01',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 52752,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x00'
}];
var doubleswitchAttributeReport2 = {};

var doubleswitchLeave = {
    msgType: 'Leave Indication',
    IEEEAddress: '0x00158d00013e6983',
    rejoinStatues: '0x00'
};
var doubleSwitchAnnounce = {
    msgType: 'Device Announce',
    shortAddress: '0xd93d',
    IEEEAddress: '0x00158d00013e6983',
    macCapability: '10000000' // double switch
};
var doubleSwitchAttributereportnew = [{
    msgType: 'Attribute Report',
    sequenceNumber: '0x00',
    shortAddress: '0xd93d',
    endPoint: '0x01',
    clusterID: '0x0000',
    attributeID: '0x0005',
    attributeSize: 15682,
    attributeType: '0x00',
    attributeData: '0x126c756d692e73656e736f725f3836737732',
    status: '0x01'
}, {
    msgType: 'Attribute Report',
    sequenceNumber: '0x00',
    shortAddress: '0xd93d',
    endPoint: '0x01',
    clusterID: '0x0000',
    attributeID: '0x0001',
    attributeSize: 15648,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x04'
}, {
    msgType: 'Attribute Report',
    sequenceNumber: '0x02',
    shortAddress: '0xd93d',
    endPoint: '0x02',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 15632,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x01'
}, {
    msgType: 'Attribute Report',
    sequenceNumber: '0x02',
    shortAddress: '0xd93d',
    endPoint: '0x02',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 15632,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x00'
}, {
    msgType: 'Attribute Report',
    sequenceNumber: '0x03',
    shortAddress: '0xd93d',
    endPoint: '0x01',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 15632,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x01'
}, {
    msgType: 'Attribute Report',
    sequenceNumber: '0x05',
    shortAddress: '0xd93d',
    endPoint: '0x01', // left key
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 37904,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x01'
}, {
    msgType: 'Attribute Report',
    sequenceNumber: '0x05',
    shortAddress: '0xd93d',
    endPoint: '0x01', //left key Up
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 37904,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x00'
}, {
    msgType: 'Attribute Report',
    sequenceNumber: '0x06',
    shortAddress: '0xd93d',
    endPoint: '0x02', //right key down
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 15632,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x01'
}, {
    msgType: 'Attribute Report',
    sequenceNumber: '0x06',
    shortAddress: '0xd93d',
    endPoint: '0x02', //right key Up
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 15632,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x00'
}];

var deviceAnnounce = {
    msgType: 'Device Announce',
    shortAddress: '0xc8ab',
    IEEEAddress: '0x00158d00012f6e57',
    macCapability: '10000100'
};
var deviceAnnounce2 = {
    msgType: 'Device Announce',
    shortAddress: '0x21f0',
    IEEEAddress: '0x00158d0001571aef',
    macCapability: '10000100'
};
var deviceAnnounce3 = {
    msgType: 'Device Announce',
    shortAddress: '0x4abf',
    IEEEAddress: '0x00158d00014cf5a5',
    macCapability: '10000100'
};


//
var a1 = {
    msgType: 'Device Announce',
    shortAddress: '0x21f0',
    IEEEAddress: '0x00158d0001571aef',
    macCapability: '10000100'
}

var b1 = { // 这是个灯的状态汇报
    msgType: 'Attribute Report',
    sequenceNumber: '0xa3',
    shortAddress: '0x21f0',
    endPoint: '0x04',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 61456,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x01'
};

var b2 = {
    msgType: 'Attribute Report',
    sequenceNumber: '0xa3',
    shortAddress: '0x21f0',
    endPoint: '0x04',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 61456,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x00'
};

var c3 = { // Single light
    msgType: 'Leave Indication',
    IEEEAddress: '0x00158d0001571aef',
    rejoinStatues: '0x00'
};
var c4 = {// single light joining
    msgType: 'Device Announcea',
    shortAddress: '0x3bd4',
    IEEEAddress: '0x00158d0001571aef',
    macCapability: '10000100'
}
var c4_1 = {
    msgType: 'Attribute Report',//第一次的属性汇报，会得到设备的类型
    sequenceNumber: '0x00',
    shortAddress: '0x3bd4',
    endPoint: '0x01',
    clusterID: '0x0000',
    attributeID: '0x0005',
    attributeSize: 54338,
    attributeType: '0x00',
    attributeData: '0x136c756d692e6374726c5f6e65757472616c31',
    status: '0x01'
};
var c4_2 = {
    msgType: 'Attribute Report',
    sequenceNumber: '0x00',
    shortAddress: '0x3bd4',
    endPoint: '0x01',
    clusterID: '0x0000',
    attributeID: '0x0001',
    attributeSize: 54304,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x01'
};
var c4_3 = { // singlelight的状态汇报
    msgType: 'Attribute Report',
    sequenceNumber: '0x01',
    shortAddress: '0x3bd4',
    endPoint: '0x02',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 54288,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x00'
}

var c4 = {
    msgType: 'Device Announce',
    shortAddress: '0x4abf',
    IEEEAddress: '0x00158d00014cf5a5',
    macCapability: '10000100'
};
var c5 = {
    msgType: 'Device Announce',
    shortAddress: '0xc8ab',
    IEEEAddress: '0x00158d00012f6e57',
    macCapability: '10000100'
};

var pillar = { //中间柱子上的DoubleLight
    msgType: 'Attribute Report',
    sequenceNumber: '0xb7',
    shortAddress: '0x4abf',
    endPoint: '0x03',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 48912,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x00'
}
var pillar_1 = {
    msgType: 'Attribute Report',
    sequenceNumber: '0xb7',
    shortAddress: '0x4abf',
    endPoint: '0x03',
    clusterID: '0x0006',
    attributeID: '0xf000',
    attributeSize: 48931,
    attributeType: '0x00',
    attributeData: '0x04034abf',
    status: '0x00'
}
var pillar_2 = {
    msgType: 'Attribute Report',
    sequenceNumber: '0xb9',
    shortAddress: '0x4abf',
    endPoint: '0x05',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 37904,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x00'
};
var pillar_3 = {  // 开灯  0x05
    msgType: 'Attribute Report',
    sequenceNumber: '0xb9',
    shortAddress: '0x4abf',
    endPoint: '0x05',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 37904,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x01'
};
var pillar_4 = {  //开灯  0x03
    msgType: 'Attribute Report',
    sequenceNumber: '0xba',
    shortAddress: '0x4abf',
    endPoint: '0x03',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 48912,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x01'
};
var pillar_5 = {
    msgType: 'Attribute Report',
    sequenceNumber: '0xba',
    shortAddress: '0x4abf',
    endPoint: '0x03',
    clusterID: '0x0006',
    attributeID: '0xf000',
    attributeSize: 48931,
    attributeType: '0x00',
    attributeData: '0x04034abf',
    status: '0x00'
};
// 双灯汇报灯状态 
var wall_1 = {   // 0x02 ep,  left socket state on
    msgType: 'Attribute Report',
    sequenceNumber: '0x01',
    shortAddress: '0xc8ab',
    endPoint: '0x02',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 43792,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x01'
};

var wall_2 = { //0x03  ep,  
    msgType: 'Attribute Report',
    sequenceNumber: '0x02',
    shortAddress: '0xc8ab',
    endPoint: '0x03',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 43792,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x00'
};
var wall_3 = {
    msgType: 'Attribute Report',
    sequenceNumber: '0x02',
    shortAddress: '0xc8ab',
    endPoint: '0x03',
    clusterID: '0x0006',
    attributeID: '0xf000',
    attributeSize: 43811,
    attributeType: '0x00',
    attributeData: '0x0402ffff',
    status: '0x00'
};
var wall_4 = {  //0x04,  right socket 0
    msgType: 'Attribute Report',
    sequenceNumber: '0x05',
    shortAddress: '0xc8ab',
    endPoint: '0x04',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 43792,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x00'
};
var wall_5 = {  // 0x04, right socket 1
    msgType: 'Attribute Report',
    sequenceNumber: '0x05',
    shortAddress: '0xc8ab',
    endPoint: '0x04',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 43792,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x01'
};
var wall_6 = {   //0x02 
    msgType: 'Attribute Report',
    sequenceNumber: '0x06',
    shortAddress: '0xc8ab',
    endPoint: '0x02',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 43792,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x01'
};
var wall_7 = {
    msgType: 'Attribute Report',
    sequenceNumber: '0x06',
    shortAddress: '0xc8ab',
    endPoint: '0x02',
    clusterID: '0x0006',
    attributeID: '0xf000',
    attributeSize: 43811,
    attributeType: '0x00',
    attributeData: '0x0403c8ab',
    status: '0x00'
};

var vwall_8 = {  // 0x04 ep, 
    msgType: 'Attribute Report',
    sequenceNumber: '0x07',
    shortAddress: '0xc8ab',
    endPoint: '0x04',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 43792,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x00'
}

// How to understand type of switch?
var dswitch =
    {
        msgType: 'Device Announce',
        shortAddress: '0xc37d',
        IEEEAddress: '0x00158d00013e6983',
        macCapability: '10000000'
    }
// Device Online: 0x00158d00013e6983
// Old shortAddress: 0x9ca0
// New shortAddress: 0xc37d;

var doubleswitch_rightkey = {
    msgType: 'Attribute Report',
    sequenceNumber: '0x22',
    shortAddress: '0xc37d',
    endPoint: '0x02',
    clusterID: '0x0006',
    attributeID: '0x0000',
    attributeSize: 32016,
    attributeType: '0x00',
    attributeData: '0x01',
    status: '0x01'
}