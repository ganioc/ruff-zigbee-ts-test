/*
DoubleLightWall  0xeaa1  0x00158d00012f6e57  左灯:ON  右灯:ON --- true 双灯
DoubleLightPillar  0x4abf  0x00158d00014cf5a5  左灯:ON  右灯:ON --- true 双灯
SingleLight  0x8176  0x00158d0001571aef  灯:ON --- true 单灯
DoubleSwitch 0xc37d  0x00158d00013e6983 true --- 双开关

{ name: 'rel2',
  emitterIEEEAddress: '0x00158d00013e6983',
  receiverIEEEAddress: '0x00158d0001571aef',
  eEP: 'left',
  rEP: 'left' }
{ name: 'rel3',
  emitterIEEEAddress: '0x00158d00013e6983',
  receiverIEEEAddress: '0x00158d0001571aef',
  eEP: 'right',
  rEP: 'left' }
{ name: 'DLW_left',
  emitterIEEEAddress: '0x00158d00013e6983',
  receiverIEEEAddress: '0x00158d00012f6e57',
  eEP: 'left',
  rEP: 'left' }

  relation DLW_left_right 0x00158d00013e6983 0x00158d00012f6e57 left right
  relation DLW_right_left 0x00158d00013e6983 0x00158d00012f6e57  right left
    relation DLW_right_right 0x00158d00013e6983 0x00158d00012f6e57  right right

  relation DLP_left_left  0x00158d00013e6983 0x00158d00014cf5a5 left left 
  relation DLP_left_right 0x00158d00013e6983 0x00158d00014cf5a5 left right
  relation DLP_right_left 0x00158d00013e6983 0x00158d00014cf5a5 right left
  relation DLP_right_right  0x00158d00013e6983 0x00158d00014cf5a5 right right



*/


