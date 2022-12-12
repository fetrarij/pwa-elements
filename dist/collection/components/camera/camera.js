import { h, Component, Element, Prop, State } from '@stencil/core';
import './imagecapture';
export class CameraPWA {
    constructor() {
        this.facingMode = 'user';
        this.noDevicesText = 'No camera found';
        this.noDevicesButtonText = 'Choose image';
        this.showShutterOverlay = false;
        this.flashIndex = 0;
        this.hasCamera = null;
        this.rotation = 0;
        this.deviceError = null;
        this.cameraHeight = 0;
        // Whether the device has multiple cameras (front/back)
        this.hasMultipleCameras = false;
        // Whether the device has flash support
        this.hasFlash = false;
        // Flash modes for camera
        this.flashModes = [];
        // Current flash mode
        this.flashMode = 'off';
        this.handlePickFile = (_e) => {
        };
        this.handleShutterClick = (_e) => {
            console.debug('shutter click');
            this.capture();
        };
        this.handleRotateClick = (_e) => {
            this.rotate();
        };
        this.handleClose = (_e) => {
            this.handlePhoto && this.handlePhoto(null);
        };
        this.handleFlashClick = (_e) => {
            this.cycleFlash();
        };
        this.handleCancelPhoto = (_e) => {
            const track = this.stream && this.stream.getTracks()[0];
            let c = track && track.getConstraints();
            this.photo = null;
            this.photoSrc = null;
            if (c) {
                this.initCamera({
                    video: {
                        facingMode: c.facingMode
                    }
                });
            }
            else {
                this.initCamera();
            }
        };
        this.handleAcceptPhoto = (_e) => {
            this.handlePhoto && this.handlePhoto(this.photo);
        };
        this.handleFileInputChange = async (e) => {
            const input = e.target;
            const file = input.files[0];
            try {
                const orientation = await this.getOrientation(file);
                console.debug('Got orientation', orientation);
                this.photoOrientation = orientation;
            }
            catch (e) {
            }
            this.handlePhoto && this.handlePhoto(file);
        };
        this.handleVideoMetadata = (e) => {
            console.debug('Video metadata', e);
        };
    }
    async componentDidLoad() {
        if (this.isServer) {
            return;
        }
        console.log('qsdqs a', this.emballageImage);
        this.defaultConstraints = {
            video: {
                facingMode: this.facingMode
            }
        };
        // Figure out how many cameras we have
        await this.queryDevices();
        // Initialize the camera
        await this.initCamera();
        this.cameraHeight = this.element.offsetHeight - 100;
        console.log('camera height', this.cameraHeight);
    }
    componentDidUnload() {
        this.stopStream();
        this.photoSrc && URL.revokeObjectURL(this.photoSrc);
    }
    hasImageCapture() {
        return 'ImageCapture' in window;
    }
    /**
     * Query the list of connected devices and figure out how many video inputs we have.
     */
    async queryDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind == 'videoinput');
            this.hasCamera = !!videoDevices.length;
            this.hasMultipleCameras = videoDevices.length > 1;
        }
        catch (e) {
            this.deviceError = e;
        }
    }
    async initCamera(constraints) {
        if (!constraints) {
            constraints = this.defaultConstraints;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia(Object.assign({ video: true, audio: false }, constraints));
            this.initStream(stream);
        }
        catch (e) {
            this.deviceError = e;
            this.handleNoDeviceError && this.handleNoDeviceError(e);
        }
    }
    async initStream(stream) {
        this.stream = stream;
        this.videoElement.srcObject = stream;
        if (this.hasImageCapture()) {
            this.imageCapture = new window.ImageCapture(stream.getVideoTracks()[0]);
            await this.initPhotoCapabilities(this.imageCapture);
        }
        else {
            this.deviceError = 'No image capture';
            this.handleNoDeviceError && this.handleNoDeviceError();
        }
        // Always re-render
        this.el.forceUpdate();
    }
    async initPhotoCapabilities(imageCapture) {
        const c = await imageCapture.getPhotoCapabilities();
        if (c.fillLightMode && c.fillLightMode.length > 1) {
            this.flashModes = c.fillLightMode.map(m => m);
            // Try to recall the current flash mode
            if (this.flashMode) {
                this.flashMode = this.flashModes[this.flashModes.indexOf(this.flashMode)] || 'off';
                this.flashIndex = this.flashModes.indexOf(this.flashMode) || 0;
            }
            else {
                this.flashIndex = 0;
            }
        }
    }
    stopStream() {
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
        this.stream && this.stream.getTracks().forEach(track => track.stop());
    }
    async capture() {
        if (this.hasImageCapture()) {
            try {
                const photo = await this.imageCapture.takePhoto({
                    fillLightMode: this.flashModes.length > 1 ? this.flashMode : undefined
                });
                await this.flashScreen();
                this.promptAccept(photo);
            }
            catch (e) {
                console.error('Unable to take photo!', e);
            }
        }
        this.stopStream();
    }
    async promptAccept(photo) {
        this.photo = photo;
        const orientation = await this.getOrientation(photo);
        console.debug('Got orientation', orientation);
        this.photoOrientation = orientation;
        if (orientation) {
            switch (orientation) {
                case 1:
                case 2:
                    this.rotation = 0;
                    break;
                case 3:
                case 4:
                    this.rotation = 180;
                    break;
                case 5:
                case 6:
                    this.rotation = 90;
                    break;
                case 7:
                case 8:
                    this.rotation = 270;
                    break;
            }
        }
        this.photoSrc = URL.createObjectURL(photo);
    }
    getOrientation(file) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const view = new DataView(event.target.result);
                if (view.getUint16(0, false) !== 0xFFD8) {
                    return resolve(-2);
                }
                const length = view.byteLength;
                let offset = 2;
                while (offset < length) {
                    const marker = view.getUint16(offset, false);
                    offset += 2;
                    if (marker === 0xFFE1) {
                        if (view.getUint32(offset += 2, false) !== 0x45786966) {
                            return resolve(-1);
                        }
                        const little = view.getUint16(offset += 6, false) === 0x4949;
                        offset += view.getUint32(offset + 4, little);
                        const tags = view.getUint16(offset, little);
                        offset += 2;
                        for (let i = 0; i < tags; i++) {
                            if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                                return resolve(view.getUint16(offset + (i * 12) + 8, little));
                            }
                        }
                    }
                    else if ((marker & 0xFF00) !== 0xFF00) {
                        break;
                    }
                    else {
                        offset += view.getUint16(offset, false);
                    }
                }
                return resolve(-1);
            };
            reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
        });
    }
    rotate() {
        this.stopStream();
        const track = this.stream && this.stream.getTracks()[0];
        if (!track) {
            return;
        }
        let c = track.getConstraints();
        let facingMode = c.facingMode;
        if (!facingMode) {
            let c = track.getCapabilities();
            if (c.facingMode) {
                facingMode = c.facingMode[0];
            }
        }
        if (facingMode === 'environment') {
            this.initCamera({
                video: {
                    facingMode: 'user'
                }
            });
        }
        else {
            this.initCamera({
                video: {
                    facingMode: 'environment'
                }
            });
        }
    }
    setFlashMode(mode) {
        console.debug('New flash mode: ', mode);
        this.flashMode = mode;
    }
    cycleFlash() {
        if (this.flashModes.length > 0) {
            this.flashIndex = (this.flashIndex + 1) % this.flashModes.length;
            this.setFlashMode(this.flashModes[this.flashIndex]);
        }
    }
    async flashScreen() {
        return new Promise((resolve, _reject) => {
            this.showShutterOverlay = true;
            setTimeout(() => {
                this.showShutterOverlay = false;
                resolve();
            }, 100);
        });
    }
    iconExit() {
        return `data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' enable-background='new 0 0 512 512' xml:space='preserve'%3E%3Cg id='Icon_5_'%3E%3Cg%3E%3Cpath fill='%23FFFFFF' d='M402.2,134L378,109.8c-1.6-1.6-4.1-1.6-5.7,0L258.8,223.4c-1.6,1.6-4.1,1.6-5.7,0L139.6,109.8 c-1.6-1.6-4.1-1.6-5.7,0L109.8,134c-1.6,1.6-1.6,4.1,0,5.7l113.5,113.5c1.6,1.6,1.6,4.1,0,5.7L109.8,372.4c-1.6,1.6-1.6,4.1,0,5.7 l24.1,24.1c1.6,1.6,4.1,1.6,5.7,0l113.5-113.5c1.6-1.6,4.1-1.6,5.7,0l113.5,113.5c1.6,1.6,4.1,1.6,5.7,0l24.1-24.1 c1.6-1.6,1.6-4.1,0-5.7L288.6,258.8c-1.6-1.6-1.6-4.1,0-5.7l113.5-113.5C403.7,138.1,403.7,135.5,402.2,134z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;
    }
    iconPhotos() {
        return (h("svg", { xmlns: 'http://www.w3.org/2000/svg', width: '512', height: '512', viewBox: '0 0 512 512' },
            h("path", { d: 'M450.29,112H142c-34,0-62,27.51-62,61.33V418.67C80,452.49,108,480,142,480H450c34,0,62-26.18,62-60V173.33C512,139.51,484.32,112,450.29,112Zm-77.15,61.34a46,46,0,1,1-46.28,46A46.19,46.19,0,0,1,373.14,173.33Zm-231.55,276c-17,0-29.86-13.75-29.86-30.66V353.85l90.46-80.79a46.54,46.54,0,0,1,63.44,1.83L328.27,337l-113,112.33ZM480,418.67a30.67,30.67,0,0,1-30.71,30.66H259L376.08,333a46.24,46.24,0,0,1,59.44-.16L480,370.59Z' }),
            h("path", { d: 'M384,32H64A64,64,0,0,0,0,96V352a64.11,64.11,0,0,0,48,62V152a72,72,0,0,1,72-72H446A64.11,64.11,0,0,0,384,32Z' })));
    }
    iconCapture() {
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70' viewBox='0 0 70 70' fill='none'%3E%3Ccircle cx='35' cy='35' r='34.5' fill='%23CA3C66' stroke='%23CA3C66'/%3E%3Ccircle cx='35' cy='35' r='28' fill='%23CA3C66' stroke='%23F9FBFC' stroke-width='2'/%3E%3C/svg%3E`;
    }
    iconConfirm() {
        return `data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' enable-background='new 0 0 512 512' xml:space='preserve'%3E%3Ccircle fill='%232CD865' cx='256' cy='256' r='256'/%3E%3Cg id='Icon_1_'%3E%3Cg%3E%3Cg%3E%3Cpath fill='%23FFFFFF' d='M208,301.4l-55.4-55.5c-1.5-1.5-4-1.6-5.6-0.1l-23.4,22.3c-1.6,1.6-1.7,4.1-0.1,5.7l81.6,81.4 c3.1,3.1,8.2,3.1,11.3,0l171.8-171.7c1.6-1.6,1.6-4.2-0.1-5.7l-23.4-22.3c-1.6-1.5-4.1-1.5-5.6,0.1L213.7,301.4 C212.1,303,209.6,303,208,301.4z'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;
    }
    iconReverseCamera() {
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='42' viewBox='0 0 40 42' fill='none'%3E%3Cpath d='M37.0203 21.9334C36.7593 21.7177 36.4234 21.6162 36.0875 21.6521C35.7515 21.6896 35.4453 21.8599 35.2375 22.1271C35.0296 22.3927 34.939 22.7318 34.9843 23.0662C35.0312 23.4006 35.2109 23.7021 35.4828 23.9021C36.6219 24.6568 37.3625 25.8834 37.5 27.2428C37.5 30.6584 31.5376 33.81 23.6296 34.5724C22.9389 34.6052 22.4061 35.1911 22.4389 35.8817C22.4717 36.5724 23.0577 37.1052 23.7467 37.0724H23.8686C33.367 36.1458 39.9998 32.1052 39.9998 27.2428C39.8998 25.1021 38.7951 23.1336 37.0201 21.9336L37.0203 21.9334Z' fill='%23CA3C66'/%3E%3Cpath d='M21.1551 35.5145C21.0926 35.363 21.0004 35.2239 20.8832 35.1083L17.1332 31.3583C16.6425 30.8833 15.8629 30.8911 15.3801 31.3724C14.8988 31.8552 14.891 32.6348 15.366 33.1255L16.8457 34.6052C8.25047 33.902 2.50047 30.4144 2.50047 27.2428C2.63797 25.8834 3.38015 24.6568 4.52079 23.9021C5.04111 23.4709 5.12547 22.7037 4.70829 22.1709C4.29265 21.6381 3.52861 21.5318 2.98329 21.9334C1.20673 23.1334 0.100488 25.1006 0.000488281 27.2426C0.000488281 32.355 7.30969 36.4458 17.0957 37.1302L15.3676 38.8583C15.1269 39.0911 14.9894 39.4114 14.9863 39.7458C14.9832 40.0818 15.116 40.4036 15.3519 40.6411C15.5894 40.8771 15.9113 41.0099 16.2473 41.0068C16.5816 41.0036 16.9019 40.8661 17.1348 40.6255L20.8848 36.8755C21.2442 36.5177 21.3504 35.9802 21.1582 35.513L21.1551 35.5145Z' fill='%23CA3C66'/%3E%3Cpath d='M32.5 29.5895V3.49268C32.5 2.8302 32.2359 2.19424 31.7672 1.72548C31.2985 1.25672 30.6625 0.992676 30 0.992676H10C8.61876 0.992676 7.5 2.11144 7.5 3.49268V29.5599C9.09688 30.424 10.8094 31.0568 12.5844 31.4396C12.8781 30.102 13.8797 29.0302 15.1953 28.6442C16.511 28.2599 17.9312 28.6239 18.9 29.5927L21.8828 32.5755C22.3406 32.3036 22.8531 32.1317 23.3828 32.0755C26.5547 31.852 29.6532 31.0083 32.5 29.5896V29.5895ZM20 10.9927H15C13.6188 10.9927 12.5 9.87392 12.5 8.49268C12.5 7.11144 13.6188 5.99268 15 5.99268H20C21.3812 5.99268 22.5 7.11144 22.5 8.49268C22.5 9.87392 21.3812 10.9927 20 10.9927Z' fill='%23CA3C66'/%3E%3C/svg%3E`;
    }
    iconRetake() {
        return ``;
    }
    iconFlashOff() {
        return `data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' style='enable-background:new 0 0 512 512;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23FFFFFF;%7D%0A%3C/style%3E%3Cg%3E%3Cpath class='st0' d='M498,483.7L42.3,28L14,56.4l149.8,149.8L91,293.8c-2.5,3-0.1,7.2,3.9,7.2h143.9c1.6,0,2.7,1.3,2.4,2.7 L197.6,507c-1,4.4,5.8,6.9,8.9,3.2l118.6-142.8L469.6,512L498,483.7z'/%3E%3Cpath class='st0' d='M449,218.2c2.5-3,0.1-7.2-3.9-7.2H301.2c-1.6,0-2.7-1.3-2.4-2.7L342.4,5c1-4.4-5.8-6.9-8.9-3.2L214.9,144.6 l161.3,161.3L449,218.2z'/%3E%3C/g%3E%3C/svg%3E`;
    }
    iconFlashOn() {
        return `data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' style='enable-background:new 0 0 512 512;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23FFFFFF;%7D%0A%3C/style%3E%3Cpath class='st0' d='M287.2,211c-1.6,0-2.7-1.3-2.4-2.7L328.4,5c1-4.4-5.8-6.9-8.9-3.2L77,293.8c-2.5,3-0.1,7.2,3.9,7.2h143.9 c1.6,0,2.7,1.3,2.4,2.7L183.6,507c-1,4.4,5.8,6.9,8.9,3.2l242.5-292c2.5-3,0.1-7.2-3.9-7.2L287.2,211L287.2,211z'/%3E%3C/svg%3E`;
    }
    iconFlashAuto() {
        return `data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' style='enable-background:new 0 0 512 512;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23FFFFFF;%7D%0A%3C/style%3E%3Cpath class='st0' d='M287.2,211c-1.6,0-2.7-1.3-2.4-2.7L328.4,5c1-4.4-5.8-6.9-8.9-3.2L77,293.8c-2.5,3-0.1,7.2,3.9,7.2h143.9 c1.6,0,2.7,1.3,2.4,2.7L183.6,507c-1,4.4,5.8,6.9,8.9,3.2l242.5-292c2.5-3,0.1-7.2-3.9-7.2L287.2,211L287.2,211z'/%3E%3Cg%3E%3Cpath class='st0' d='M321.3,186l74-186H438l74,186h-43.5l-11.9-32.5h-80.9l-12,32.5H321.3z M415.8,47.9l-27.2,70.7h54.9l-27.2-70.7 H415.8z'/%3E%3C/g%3E%3C/svg%3E`;
    }
    render() {
        // const acceptStyles = { transform: `rotate(${-this.rotation}deg)` };
        const acceptStyles = {};
        return (h("div", { class: "camera-wrapper" },
            (this.hasCamera === false || !!this.deviceError) && (h("div", { class: "no-device" },
                h("h2", null, this.noDevicesText),
                h("label", { htmlFor: "_pwa-elements-camera-input" }, this.noDevicesButtonText),
                h("input", { type: "file", id: "_pwa-elements-camera-input", onChange: this.handleFileInputChange, accept: "image/*", class: "select-file-button" }))),
            this.photoSrc ? (h("div", { class: "accept" },
                h("div", { class: "accept-image", style: Object.assign({ backgroundImage: `url(${this.photoSrc})` }, acceptStyles) }))) : (h("div", { class: "camera-image-wrapper" },
                h("div", { class: "photo-frame", ref: (el) => this.element = el }, this.emballageImage && h("img", { src: this.emballageImage })),
                h("div", { class: "camera-video" },
                    this.showShutterOverlay && (h("div", { class: "shutter-overlay" })),
                    this.hasImageCapture() ? (h("video", { style: { height: this.cameraHeight + 'px' }, ref: (el) => this.videoElement = el, onLoadedMetaData: this.handleVideoMetadata, autoplay: true, playsinline: true })) : (h("canvas", { ref: (el) => this.canvasElement = el, width: "100%", height: "100%" })),
                    h("canvas", { class: "offscreen-image-render", ref: e => this.offscreenCanvas = e, width: "100%", height: "100%" })))),
            this.hasCamera && (h("div", { class: "camera-footer" }, !this.photo ? ([
                h("div", null),
                h("div", { class: "shutter", onClick: this.handleShutterClick },
                    h("img", { src: this.iconCapture() })),
                h("div", { class: "rotate", onClick: this.handleRotateClick },
                    h("img", { src: this.iconReverseCamera() })),
            ]) : (h("section", { class: "items" },
                h("div", { class: "item accept-cancel", onClick: e => this.handleCancelPhoto(e) },
                    h("img", { src: this.iconRetake() })),
                h("div", { class: "item accept-use", onClick: e => this.handleAcceptPhoto(e) },
                    h("img", { src: this.iconConfirm() }))))))));
    }
    static get is() { return "pwa-camera"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["camera.css"]
    }; }
    static get styleUrls() { return {
        "$": ["camera.css"]
    }; }
    static get assetsDirs() { return ["icons"]; }
    static get properties() { return {
        "facingMode": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "facing-mode",
            "reflect": false,
            "defaultValue": "'user'"
        },
        "handlePhoto": {
            "type": "unknown",
            "mutable": false,
            "complexType": {
                "original": "(photo: Blob) => void",
                "resolved": "(photo: Blob) => void",
                "references": {
                    "Blob": {
                        "location": "global"
                    }
                }
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            }
        },
        "handleNoDeviceError": {
            "type": "unknown",
            "mutable": false,
            "complexType": {
                "original": "(e?: any) => void",
                "resolved": "(e?: any) => void",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            }
        },
        "handleOnCapture": {
            "type": "unknown",
            "mutable": false,
            "complexType": {
                "original": "(e?: any) => void",
                "resolved": "(e?: any) => void",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            }
        },
        "handleOnRotate": {
            "type": "unknown",
            "mutable": false,
            "complexType": {
                "original": "(e?: any) => void",
                "resolved": "(e?: any) => void",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            }
        },
        "noDevicesText": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "no-devices-text",
            "reflect": false,
            "defaultValue": "'No camera found'"
        },
        "noDevicesButtonText": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "no-devices-button-text",
            "reflect": false,
            "defaultValue": "'Choose image'"
        },
        "emballageImage": {
            "type": "any",
            "mutable": false,
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "emballage-image",
            "reflect": false
        }
    }; }
    static get contextProps() { return [{
            "name": "isServer",
            "context": "isServer"
        }]; }
    static get states() { return {
        "photo": {},
        "photoSrc": {},
        "showShutterOverlay": {},
        "flashIndex": {},
        "hasCamera": {},
        "rotation": {},
        "deviceError": {},
        "cameraHeight": {}
    }; }
    static get elementRef() { return "el"; }
}
