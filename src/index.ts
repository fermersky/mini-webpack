import {name} from './name'

export interface IPerson {
    firstname: string,
    lastname: string,
    age: number
}

navigator.mediaDevices.enumerateDevices().then((devices: MediaDeviceInfo[]) => {
    console.log('Hey ', name, ' you have these devices in your system')
    
    devices.map(device => {
        console.log(device.label)
    })
})
