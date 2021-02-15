import { name } from './name';
navigator.mediaDevices.enumerateDevices().then((devices) => {
    console.log('Hey ', name, ' you have these devices in your system');
    devices.map(device => {
        console.log(device.label);
    });
});
