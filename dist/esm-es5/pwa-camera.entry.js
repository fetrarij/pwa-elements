var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { r as registerInstance, e as getContext, h, g as getElement } from './index-8be597a0.js';
/**
 * MediaStream ImageCapture polyfill
 *
 * @license
 * Copyright 2018 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ImageCapture = window.ImageCapture;
if (typeof ImageCapture === 'undefined') {
    ImageCapture = /** @class */ (function () {
        /**
         * TODO https://www.w3.org/TR/image-capture/#constructors
         *
         * @param {MediaStreamTrack} videoStreamTrack - A MediaStreamTrack of the 'video' kind
         */
        function ImageCapture(videoStreamTrack) {
            var _this = this;
            if (videoStreamTrack.kind !== 'video')
                throw new DOMException('NotSupportedError');
            this._videoStreamTrack = videoStreamTrack;
            if (!('readyState' in this._videoStreamTrack)) {
                // Polyfill for Firefox
                this._videoStreamTrack.readyState = 'live';
            }
            // MediaStream constructor not available until Chrome 55 - https://www.chromestatus.com/feature/5912172546752512
            this._previewStream = new MediaStream([videoStreamTrack]);
            this.videoElement = document.createElement('video');
            this.videoElementPlaying = new Promise(function (resolve) {
                _this.videoElement.addEventListener('playing', resolve);
            });
            if (HTMLMediaElement) {
                this.videoElement.srcObject = this._previewStream; // Safari 11 doesn't allow use of createObjectURL for MediaStream
            }
            else {
                this.videoElement.src = URL.createObjectURL(this._previewStream);
            }
            this.videoElement.muted = true;
            this.videoElement.setAttribute('playsinline', ''); // Required by Safari on iOS 11. See https://webkit.org/blog/6784
            this.videoElement.play();
            this.canvasElement = document.createElement('canvas');
            // TODO Firefox has https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
            this.canvas2dContext = this.canvasElement.getContext('2d');
        }
        Object.defineProperty(ImageCapture.prototype, "videoStreamTrack", {
            /**
             * https://w3c.github.io/mediacapture-image/index.html#dom-imagecapture-videostreamtrack
             * @return {MediaStreamTrack} The MediaStreamTrack passed into the constructor
             */
            get: function () {
                return this._videoStreamTrack;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-getphotocapabilities
         * @return {Promise<PhotoCapabilities>} Fulfilled promise with
         * [PhotoCapabilities](https://www.w3.org/TR/image-capture/#idl-def-photocapabilities)
         * object on success, rejected promise on failure
         */
        ImageCapture.prototype.getPhotoCapabilities = function () {
            return new Promise(function executorGPC(resolve, reject) {
                // TODO see https://github.com/w3c/mediacapture-image/issues/97
                var MediaSettingsRange = {
                    current: 0, min: 0, max: 0,
                };
                resolve({
                    exposureCompensation: MediaSettingsRange,
                    exposureMode: 'none',
                    fillLightMode: ['none'],
                    focusMode: 'none',
                    imageHeight: MediaSettingsRange,
                    imageWidth: MediaSettingsRange,
                    iso: MediaSettingsRange,
                    redEyeReduction: false,
                    whiteBalanceMode: 'none',
                    zoom: MediaSettingsRange,
                });
                reject(new DOMException('OperationError'));
            });
        };
        /**
         * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-setoptions
         * @param {Object} photoSettings - Photo settings dictionary, https://www.w3.org/TR/image-capture/#idl-def-photosettings
         * @return {Promise<void>} Fulfilled promise on success, rejected promise on failure
         */
        ImageCapture.prototype.setOptions = function (_photoSettings) {
            if (_photoSettings === void 0) { _photoSettings = {}; }
            return new Promise(function executorSO(_resolve, _reject) {
                // TODO
            });
        };
        /**
         * TODO
         * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-takephoto
         * @return {Promise<Blob>} Fulfilled promise with [Blob](https://www.w3.org/TR/FileAPI/#blob)
         * argument on success; rejected promise on failure
         */
        ImageCapture.prototype.takePhoto = function () {
            var self = this;
            return new Promise(function executorTP(resolve, reject) {
                // `If the readyState of the MediaStreamTrack provided in the constructor is not live,
                // return a promise rejected with a new DOMException whose name is "InvalidStateError".`
                if (self._videoStreamTrack.readyState !== 'live') {
                    return reject(new DOMException('InvalidStateError'));
                }
                self.videoElementPlaying.then(function () {
                    try {
                        self.canvasElement.width = self.videoElement.videoWidth;
                        self.canvasElement.height = self.videoElement.videoHeight;
                        self.canvas2dContext.drawImage(self.videoElement, 0, 0);
                        self.canvasElement.toBlob(resolve);
                    }
                    catch (error) {
                        reject(new DOMException('UnknownError'));
                    }
                });
            });
        };
        /**
         * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-grabframe
         * @return {Promise<ImageBitmap>} Fulfilled promise with
         * [ImageBitmap](https://www.w3.org/TR/html51/webappapis.html#webappapis-images)
         * argument on success; rejected promise on failure
         */
        ImageCapture.prototype.grabFrame = function () {
            var self = this;
            return new Promise(function executorGF(resolve, reject) {
                // `If the readyState of the MediaStreamTrack provided in the constructor is not live,
                // return a promise rejected with a new DOMException whose name is "InvalidStateError".`
                if (self._videoStreamTrack.readyState !== 'live') {
                    return reject(new DOMException('InvalidStateError'));
                }
                self.videoElementPlaying.then(function () {
                    try {
                        self.canvasElement.width = self.videoElement.videoWidth;
                        self.canvasElement.height = self.videoElement.videoHeight;
                        self.canvas2dContext.drawImage(self.videoElement, 0, 0);
                        // TODO polyfill https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmapFactories/createImageBitmap for IE
                        resolve(window.createImageBitmap(self.canvasElement));
                    }
                    catch (error) {
                        reject(new DOMException('UnknownError'));
                    }
                });
            });
        };
        return ImageCapture;
    }());
}
window.ImageCapture = ImageCapture;
var cameraCss = ":host{background-color:#e5b1d7;-ms-flex-pack:center;justify-content:center;-ms-flex-align:center;align-items:center;display:-ms-flexbox;display:flex;--header-height:4em;--footer-height:9em;--header-height-landscape:3em;--footer-height-landscape:6em;--shutter-size:6em;--icon-size-header:1.5em;--icon-size-footer:2.5em;--margin-size-header:1.5em;--margin-size-footer:2.0em;font-family:-apple-system, BlinkMacSystemFont,\n    “Segoe UI”, “Roboto”, “Droid Sans”, “Helvetica Neue”, sans-serif;width:100%;height:100%}.items{-webkit-box-sizing:border-box;box-sizing:border-box;display:-ms-flexbox;display:flex;width:100%;height:100%;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center}.items .item{-ms-flex:1;flex:1;text-align:center}.items .item:first-child{text-align:left}.items .item:last-child{text-align:right}.camera-wrapper{position:relative;display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;width:92%;padding-top:10px;height:100%}.camera-header{color:white;background-color:black;height:var(--header-height)}.camera-header .items{padding:var(--margin-size-header)}.camera-footer{position:relative;color:white;background-color:transparent;z-index:2;height:var(--footer-height)}.camera-footer .items{padding:var(--margin-size-footer)}@media (max-height: 375px){.camera-header{--header-height:var(--header-height-landscape)}.camera-footer{--footer-height:var(--footer-height-landscape)}.camera-footer .shutter{--shutter-size:4em}}.camera-video{position:relative;-ms-flex:1;flex:1;overflow:hidden;background-color:black}video{width:100%;height:100%;max-height:100%;min-height:100%;-o-object-fit:cover;object-fit:cover;background-color:black}.pick-image{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;position:absolute;left:var(--margin-size-footer);top:0;height:100%;width:var(--icon-size-footer);color:white}.pick-image input{visibility:hidden}.pick-image svg{cursor:pointer;fill:white;width:var(--icon-size-footer);height:var(--icon-size-footer)}.shutter{position:absolute;left:50%;top:50%;width:var(--shutter-size);height:var(--shutter-size);margin-top:calc(var(--shutter-size) / -2);margin-left:calc(var(--shutter-size) / -2);border-radius:100%;padding:12px;-webkit-box-sizing:border-box;box-sizing:border-box}.shutter:active .shutter-button{background-color:#9da9bb}.shutter-button{background-color:white;border-radius:100%;width:100%;height:100%}.rotate{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;position:absolute;right:var(--margin-size-footer);top:0;height:100%;width:var(--icon-size-footer);color:white}.rotate img{width:var(--icon-size-footer);height:var(--icon-size-footer)}.shutter-overlay{z-index:5;position:absolute;width:100%;height:100%;background-color:black}.error{width:100%;height:100%;color:white;display:-ms-flexbox;display:flex;-ms-flex-pack:center;justify-content:center;-ms-flex-align:center;align-items:center}.no-device{background-color:black;-ms-flex:1;flex:1;display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;color:white}.no-device label{cursor:pointer;background:#fff;border-radius:6px;padding:6px 8px;color:black}.no-device input{visibility:hidden;height:0;margin-top:16px}.accept{background-color:black;-ms-flex:1;flex:1;overflow:hidden}.accept .accept-image{width:100%;height:100%;max-height:100%;background-position:center center;background-size:cover;background-repeat:no-repeat}.close img{cursor:pointer;width:var(--icon-size-header);height:var(--icon-size-header)}.flash img{width:var(--icon-size-header);height:var(--icon-size-header)}.accept-use img{width:var(--icon-size-footer);height:var(--icon-size-footer)}.accept-cancel img{width:var(--icon-size-footer);height:var(--icon-size-footer)}.offscreen-image-render{top:0;left:0;visibility:hidden;pointer-events:none;width:100%;height:100%}.camera-image-wrapper{text-align:center;-ms-flex-pack:center;justify-content:center;-ms-flex-align:start;align-items:flex-start;display:-ms-flexbox;display:flex}.camera-image-wrapper .photo-frame{position:absolute;width:100%;z-index:1}.camera-image-wrapper .photo-frame img{width:100%}.camera-footer{margin-top:100px}";
var CameraPWA = /** @class */ (function () {
    function class_1(hostRef) {
        var _this = this;
        registerInstance(this, hostRef);
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
        this.handlePickFile = function (_e) {
        };
        this.handleShutterClick = function (_e) {
            console.debug('shutter click');
            _this.capture();
        };
        this.handleRotateClick = function (_e) {
            _this.rotate();
        };
        this.handleClose = function (_e) {
            _this.handlePhoto && _this.handlePhoto(null);
        };
        this.handleFlashClick = function (_e) {
            _this.cycleFlash();
        };
        this.handleCancelPhoto = function (_e) {
            var track = _this.stream && _this.stream.getTracks()[0];
            var c = track && track.getConstraints();
            _this.photo = null;
            _this.photoSrc = null;
            if (c) {
                _this.initCamera({
                    video: {
                        facingMode: c.facingMode
                    }
                });
            }
            else {
                _this.initCamera();
            }
        };
        this.handleAcceptPhoto = function (_e) {
            _this.handlePhoto && _this.handlePhoto(_this.photo);
        };
        this.handleFileInputChange = function (e) { return __awaiter(_this, void 0, void 0, function () {
            var input, file, orientation, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        input = e.target;
                        file = input.files[0];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getOrientation(file)];
                    case 2:
                        orientation = _a.sent();
                        console.debug('Got orientation', orientation);
                        this.photoOrientation = orientation;
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        this.handlePhoto && this.handlePhoto(file);
                        return [2 /*return*/];
                }
            });
        }); };
        this.handleVideoMetadata = function (e) {
            console.debug('Video metadata', e);
        };
        this.isServer = getContext(this, "isServer");
    }
    class_1.prototype.componentDidLoad = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isServer) {
                            return [2 /*return*/];
                        }
                        console.log('qsdqs a', this.emballageImage);
                        this.defaultConstraints = {
                            video: {
                                facingMode: this.facingMode
                            }
                        };
                        // Figure out how many cameras we have
                        return [4 /*yield*/, this.queryDevices()];
                    case 1:
                        // Figure out how many cameras we have
                        _a.sent();
                        // Initialize the camera
                        return [4 /*yield*/, this.initCamera()];
                    case 2:
                        // Initialize the camera
                        _a.sent();
                        this.cameraHeight = this.element.offsetHeight - 100;
                        console.log('camera height', this.cameraHeight);
                        return [2 /*return*/];
                }
            });
        });
    };
    class_1.prototype.componentDidUnload = function () {
        this.stopStream();
        this.photoSrc && URL.revokeObjectURL(this.photoSrc);
    };
    class_1.prototype.hasImageCapture = function () {
        return 'ImageCapture' in window;
    };
    /**
     * Query the list of connected devices and figure out how many video inputs we have.
     */
    class_1.prototype.queryDevices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var devices, videoDevices, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                    case 1:
                        devices = _a.sent();
                        videoDevices = devices.filter(function (d) { return d.kind == 'videoinput'; });
                        this.hasCamera = !!videoDevices.length;
                        this.hasMultipleCameras = videoDevices.length > 1;
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        this.deviceError = e_2;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    class_1.prototype.initCamera = function (constraints) {
        return __awaiter(this, void 0, void 0, function () {
            var stream, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!constraints) {
                            constraints = this.defaultConstraints;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia(Object.assign({ video: true, audio: false }, constraints))];
                    case 2:
                        stream = _a.sent();
                        this.initStream(stream);
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _a.sent();
                        this.deviceError = e_3;
                        this.handleNoDeviceError && this.handleNoDeviceError(e_3);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    class_1.prototype.initStream = function (stream) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.stream = stream;
                        this.videoElement.srcObject = stream;
                        if (!this.hasImageCapture()) return [3 /*break*/, 2];
                        this.imageCapture = new window.ImageCapture(stream.getVideoTracks()[0]);
                        return [4 /*yield*/, this.initPhotoCapabilities(this.imageCapture)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        this.deviceError = 'No image capture';
                        this.handleNoDeviceError && this.handleNoDeviceError();
                        _a.label = 3;
                    case 3:
                        // Always re-render
                        this.el.forceUpdate();
                        return [2 /*return*/];
                }
            });
        });
    };
    class_1.prototype.initPhotoCapabilities = function (imageCapture) {
        return __awaiter(this, void 0, void 0, function () {
            var c;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, imageCapture.getPhotoCapabilities()];
                    case 1:
                        c = _a.sent();
                        if (c.fillLightMode && c.fillLightMode.length > 1) {
                            this.flashModes = c.fillLightMode.map(function (m) { return m; });
                            // Try to recall the current flash mode
                            if (this.flashMode) {
                                this.flashMode = this.flashModes[this.flashModes.indexOf(this.flashMode)] || 'off';
                                this.flashIndex = this.flashModes.indexOf(this.flashMode) || 0;
                            }
                            else {
                                this.flashIndex = 0;
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    class_1.prototype.stopStream = function () {
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
        this.stream && this.stream.getTracks().forEach(function (track) { return track.stop(); });
    };
    class_1.prototype.capture = function () {
        return __awaiter(this, void 0, void 0, function () {
            var photo, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.hasImageCapture()) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.imageCapture.takePhoto({
                                fillLightMode: this.flashModes.length > 1 ? this.flashMode : undefined
                            })];
                    case 2:
                        photo = _a.sent();
                        return [4 /*yield*/, this.flashScreen()];
                    case 3:
                        _a.sent();
                        this.promptAccept(photo);
                        return [3 /*break*/, 5];
                    case 4:
                        e_4 = _a.sent();
                        console.error('Unable to take photo!', e_4);
                        return [3 /*break*/, 5];
                    case 5:
                        this.stopStream();
                        return [2 /*return*/];
                }
            });
        });
    };
    class_1.prototype.promptAccept = function (photo) {
        return __awaiter(this, void 0, void 0, function () {
            var orientation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.photo = photo;
                        return [4 /*yield*/, this.getOrientation(photo)];
                    case 1:
                        orientation = _a.sent();
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
                        return [2 /*return*/];
                }
            });
        });
    };
    class_1.prototype.getOrientation = function (file) {
        return new Promise(function (resolve) {
            var reader = new FileReader();
            reader.onload = function (event) {
                var view = new DataView(event.target.result);
                if (view.getUint16(0, false) !== 0xFFD8) {
                    return resolve(-2);
                }
                var length = view.byteLength;
                var offset = 2;
                while (offset < length) {
                    var marker = view.getUint16(offset, false);
                    offset += 2;
                    if (marker === 0xFFE1) {
                        if (view.getUint32(offset += 2, false) !== 0x45786966) {
                            return resolve(-1);
                        }
                        var little = view.getUint16(offset += 6, false) === 0x4949;
                        offset += view.getUint32(offset + 4, little);
                        var tags = view.getUint16(offset, little);
                        offset += 2;
                        for (var i = 0; i < tags; i++) {
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
    };
    class_1.prototype.rotate = function () {
        this.stopStream();
        var track = this.stream && this.stream.getTracks()[0];
        if (!track) {
            return;
        }
        var c = track.getConstraints();
        var facingMode = c.facingMode;
        if (!facingMode) {
            var c_1 = track.getCapabilities();
            if (c_1.facingMode) {
                facingMode = c_1.facingMode[0];
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
    };
    class_1.prototype.setFlashMode = function (mode) {
        console.debug('New flash mode: ', mode);
        this.flashMode = mode;
    };
    class_1.prototype.cycleFlash = function () {
        if (this.flashModes.length > 0) {
            this.flashIndex = (this.flashIndex + 1) % this.flashModes.length;
            this.setFlashMode(this.flashModes[this.flashIndex]);
        }
    };
    class_1.prototype.flashScreen = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, _reject) {
                        _this.showShutterOverlay = true;
                        setTimeout(function () {
                            _this.showShutterOverlay = false;
                            resolve();
                        }, 100);
                    })];
            });
        });
    };
    class_1.prototype.iconExit = function () {
        return "data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' enable-background='new 0 0 512 512' xml:space='preserve'%3E%3Cg id='Icon_5_'%3E%3Cg%3E%3Cpath fill='%23FFFFFF' d='M402.2,134L378,109.8c-1.6-1.6-4.1-1.6-5.7,0L258.8,223.4c-1.6,1.6-4.1,1.6-5.7,0L139.6,109.8 c-1.6-1.6-4.1-1.6-5.7,0L109.8,134c-1.6,1.6-1.6,4.1,0,5.7l113.5,113.5c1.6,1.6,1.6,4.1,0,5.7L109.8,372.4c-1.6,1.6-1.6,4.1,0,5.7 l24.1,24.1c1.6,1.6,4.1,1.6,5.7,0l113.5-113.5c1.6-1.6,4.1-1.6,5.7,0l113.5,113.5c1.6,1.6,4.1,1.6,5.7,0l24.1-24.1 c1.6-1.6,1.6-4.1,0-5.7L288.6,258.8c-1.6-1.6-1.6-4.1,0-5.7l113.5-113.5C403.7,138.1,403.7,135.5,402.2,134z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
    };
    class_1.prototype.iconPhotos = function () {
        return (h("svg", { xmlns: 'http://www.w3.org/2000/svg', width: '512', height: '512', viewBox: '0 0 512 512' }, h("path", { d: 'M450.29,112H142c-34,0-62,27.51-62,61.33V418.67C80,452.49,108,480,142,480H450c34,0,62-26.18,62-60V173.33C512,139.51,484.32,112,450.29,112Zm-77.15,61.34a46,46,0,1,1-46.28,46A46.19,46.19,0,0,1,373.14,173.33Zm-231.55,276c-17,0-29.86-13.75-29.86-30.66V353.85l90.46-80.79a46.54,46.54,0,0,1,63.44,1.83L328.27,337l-113,112.33ZM480,418.67a30.67,30.67,0,0,1-30.71,30.66H259L376.08,333a46.24,46.24,0,0,1,59.44-.16L480,370.59Z' }), h("path", { d: 'M384,32H64A64,64,0,0,0,0,96V352a64.11,64.11,0,0,0,48,62V152a72,72,0,0,1,72-72H446A64.11,64.11,0,0,0,384,32Z' })));
    };
    class_1.prototype.iconCapture = function () {
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70' viewBox='0 0 70 70' fill='none'%3E%3Ccircle cx='35' cy='35' r='34.5' fill='%23CA3C66' stroke='%23CA3C66'/%3E%3Ccircle cx='35' cy='35' r='28' fill='%23CA3C66' stroke='%23F9FBFC' stroke-width='2'/%3E%3C/svg%3E";
    };
    class_1.prototype.iconConfirm = function () {
        return "data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' enable-background='new 0 0 512 512' xml:space='preserve'%3E%3Ccircle fill='%232CD865' cx='256' cy='256' r='256'/%3E%3Cg id='Icon_1_'%3E%3Cg%3E%3Cg%3E%3Cpath fill='%23FFFFFF' d='M208,301.4l-55.4-55.5c-1.5-1.5-4-1.6-5.6-0.1l-23.4,22.3c-1.6,1.6-1.7,4.1-0.1,5.7l81.6,81.4 c3.1,3.1,8.2,3.1,11.3,0l171.8-171.7c1.6-1.6,1.6-4.2-0.1-5.7l-23.4-22.3c-1.6-1.5-4.1-1.5-5.6,0.1L213.7,301.4 C212.1,303,209.6,303,208,301.4z'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
    };
    class_1.prototype.iconReverseCamera = function () {
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='42' viewBox='0 0 40 42' fill='none'%3E%3Cpath d='M37.0203 21.9334C36.7593 21.7177 36.4234 21.6162 36.0875 21.6521C35.7515 21.6896 35.4453 21.8599 35.2375 22.1271C35.0296 22.3927 34.939 22.7318 34.9843 23.0662C35.0312 23.4006 35.2109 23.7021 35.4828 23.9021C36.6219 24.6568 37.3625 25.8834 37.5 27.2428C37.5 30.6584 31.5376 33.81 23.6296 34.5724C22.9389 34.6052 22.4061 35.1911 22.4389 35.8817C22.4717 36.5724 23.0577 37.1052 23.7467 37.0724H23.8686C33.367 36.1458 39.9998 32.1052 39.9998 27.2428C39.8998 25.1021 38.7951 23.1336 37.0201 21.9336L37.0203 21.9334Z' fill='%23CA3C66'/%3E%3Cpath d='M21.1551 35.5145C21.0926 35.363 21.0004 35.2239 20.8832 35.1083L17.1332 31.3583C16.6425 30.8833 15.8629 30.8911 15.3801 31.3724C14.8988 31.8552 14.891 32.6348 15.366 33.1255L16.8457 34.6052C8.25047 33.902 2.50047 30.4144 2.50047 27.2428C2.63797 25.8834 3.38015 24.6568 4.52079 23.9021C5.04111 23.4709 5.12547 22.7037 4.70829 22.1709C4.29265 21.6381 3.52861 21.5318 2.98329 21.9334C1.20673 23.1334 0.100488 25.1006 0.000488281 27.2426C0.000488281 32.355 7.30969 36.4458 17.0957 37.1302L15.3676 38.8583C15.1269 39.0911 14.9894 39.4114 14.9863 39.7458C14.9832 40.0818 15.116 40.4036 15.3519 40.6411C15.5894 40.8771 15.9113 41.0099 16.2473 41.0068C16.5816 41.0036 16.9019 40.8661 17.1348 40.6255L20.8848 36.8755C21.2442 36.5177 21.3504 35.9802 21.1582 35.513L21.1551 35.5145Z' fill='%23CA3C66'/%3E%3Cpath d='M32.5 29.5895V3.49268C32.5 2.8302 32.2359 2.19424 31.7672 1.72548C31.2985 1.25672 30.6625 0.992676 30 0.992676H10C8.61876 0.992676 7.5 2.11144 7.5 3.49268V29.5599C9.09688 30.424 10.8094 31.0568 12.5844 31.4396C12.8781 30.102 13.8797 29.0302 15.1953 28.6442C16.511 28.2599 17.9312 28.6239 18.9 29.5927L21.8828 32.5755C22.3406 32.3036 22.8531 32.1317 23.3828 32.0755C26.5547 31.852 29.6532 31.0083 32.5 29.5896V29.5895ZM20 10.9927H15C13.6188 10.9927 12.5 9.87392 12.5 8.49268C12.5 7.11144 13.6188 5.99268 15 5.99268H20C21.3812 5.99268 22.5 7.11144 22.5 8.49268C22.5 9.87392 21.3812 10.9927 20 10.9927Z' fill='%23CA3C66'/%3E%3C/svg%3E";
    };
    class_1.prototype.iconRetake = function () {
        return "";
    };
    class_1.prototype.iconFlashOff = function () {
        return "data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' style='enable-background:new 0 0 512 512;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23FFFFFF;%7D%0A%3C/style%3E%3Cg%3E%3Cpath class='st0' d='M498,483.7L42.3,28L14,56.4l149.8,149.8L91,293.8c-2.5,3-0.1,7.2,3.9,7.2h143.9c1.6,0,2.7,1.3,2.4,2.7 L197.6,507c-1,4.4,5.8,6.9,8.9,3.2l118.6-142.8L469.6,512L498,483.7z'/%3E%3Cpath class='st0' d='M449,218.2c2.5-3,0.1-7.2-3.9-7.2H301.2c-1.6,0-2.7-1.3-2.4-2.7L342.4,5c1-4.4-5.8-6.9-8.9-3.2L214.9,144.6 l161.3,161.3L449,218.2z'/%3E%3C/g%3E%3C/svg%3E";
    };
    class_1.prototype.iconFlashOn = function () {
        return "data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' style='enable-background:new 0 0 512 512;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23FFFFFF;%7D%0A%3C/style%3E%3Cpath class='st0' d='M287.2,211c-1.6,0-2.7-1.3-2.4-2.7L328.4,5c1-4.4-5.8-6.9-8.9-3.2L77,293.8c-2.5,3-0.1,7.2,3.9,7.2h143.9 c1.6,0,2.7,1.3,2.4,2.7L183.6,507c-1,4.4,5.8,6.9,8.9,3.2l242.5-292c2.5-3,0.1-7.2-3.9-7.2L287.2,211L287.2,211z'/%3E%3C/svg%3E";
    };
    class_1.prototype.iconFlashAuto = function () {
        return "data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' style='enable-background:new 0 0 512 512;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23FFFFFF;%7D%0A%3C/style%3E%3Cpath class='st0' d='M287.2,211c-1.6,0-2.7-1.3-2.4-2.7L328.4,5c1-4.4-5.8-6.9-8.9-3.2L77,293.8c-2.5,3-0.1,7.2,3.9,7.2h143.9 c1.6,0,2.7,1.3,2.4,2.7L183.6,507c-1,4.4,5.8,6.9,8.9,3.2l242.5-292c2.5-3,0.1-7.2-3.9-7.2L287.2,211L287.2,211z'/%3E%3Cg%3E%3Cpath class='st0' d='M321.3,186l74-186H438l74,186h-43.5l-11.9-32.5h-80.9l-12,32.5H321.3z M415.8,47.9l-27.2,70.7h54.9l-27.2-70.7 H415.8z'/%3E%3C/g%3E%3C/svg%3E";
    };
    class_1.prototype.render = function () {
        var _this = this;
        // const acceptStyles = { transform: `rotate(${-this.rotation}deg)` };
        var acceptStyles = {};
        return (h("div", { class: "camera-wrapper" }, (this.hasCamera === false || !!this.deviceError) && (h("div", { class: "no-device" }, h("h2", null, this.noDevicesText), h("label", { htmlFor: "_pwa-elements-camera-input" }, this.noDevicesButtonText), h("input", { type: "file", id: "_pwa-elements-camera-input", onChange: this.handleFileInputChange, accept: "image/*", class: "select-file-button" }))), this.photoSrc ? (h("div", { class: "accept" }, h("div", { class: "accept-image", style: Object.assign({ backgroundImage: "url(" + this.photoSrc + ")" }, acceptStyles) }))) : (h("div", { class: "camera-image-wrapper" }, h("div", { class: "photo-frame", ref: function (el) { return _this.element = el; } }, this.emballageImage && h("img", { src: this.emballageImage })), h("div", { class: "camera-video" }, this.showShutterOverlay && (h("div", { class: "shutter-overlay" })), this.hasImageCapture() ? (h("video", { style: { height: this.cameraHeight + 'px' }, ref: function (el) { return _this.videoElement = el; }, onLoadedMetaData: this.handleVideoMetadata, autoplay: true, playsinline: true })) : (h("canvas", { ref: function (el) { return _this.canvasElement = el; }, width: "100%", height: "100%" })), h("canvas", { class: "offscreen-image-render", ref: function (e) { return _this.offscreenCanvas = e; }, width: "100%", height: "100%" })))), this.hasCamera && (h("div", { class: "camera-footer" }, !this.photo ? ([
            h("div", null),
            h("div", { class: "shutter", onClick: this.handleShutterClick }, h("img", { src: this.iconCapture() })),
            h("div", { class: "rotate", onClick: this.handleRotateClick }, h("img", { src: this.iconReverseCamera() })),
        ]) : (h("section", { class: "items" }, h("div", { class: "item accept-cancel", onClick: function (e) { return _this.handleCancelPhoto(e); } }, h("img", { src: this.iconRetake() })), h("div", { class: "item accept-use", onClick: function (e) { return _this.handleAcceptPhoto(e); } }, h("img", { src: this.iconConfirm() }))))))));
    };
    Object.defineProperty(class_1, "assetsDirs", {
        get: function () { return ["icons"]; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_1.prototype, "el", {
        get: function () { return getElement(this); },
        enumerable: false,
        configurable: true
    });
    return class_1;
}());
CameraPWA.style = cameraCss;
export { CameraPWA as pwa_camera };
