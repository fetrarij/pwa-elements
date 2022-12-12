import { b as bootstrapLazy } from './index-8be597a0.js';
import { a as patchEsm } from './patch-c62dfddd.js';
var defineCustomElements = function (win, options) {
    if (typeof window === 'undefined')
        return Promise.resolve();
    return patchEsm().then(function () {
        return bootstrapLazy([["pwa-camera-modal", [[1, "pwa-camera-modal", { "facingMode": [1, "facing-mode"], "emballageImage": [8, "emballage-image"], "present": [64], "dismiss": [64] }]]], ["pwa-action-sheet", [[1, "pwa-action-sheet", { "header": [1], "cancelable": [4], "options": [16], "open": [32] }]]], ["pwa-toast", [[1, "pwa-toast", { "message": [1], "duration": [2], "closing": [32] }]]], ["pwa-camera", [[1, "pwa-camera", { "facingMode": [1, "facing-mode"], "handlePhoto": [16], "handleNoDeviceError": [16], "handleOnCapture": [16], "handleOnRotate": [16], "noDevicesText": [1, "no-devices-text"], "noDevicesButtonText": [1, "no-devices-button-text"], "emballageImage": [8, "emballage-image"], "photo": [32], "photoSrc": [32], "showShutterOverlay": [32], "flashIndex": [32], "hasCamera": [32], "rotation": [32], "deviceError": [32], "cameraHeight": [32] }]]], ["pwa-camera-modal-instance", [[1, "pwa-camera-modal-instance", { "facingMode": [1, "facing-mode"], "noDevicesText": [1, "no-devices-text"], "noDevicesButtonText": [1, "no-devices-button-text"], "emballageImage": [8, "emballage-image"] }, [[32, "keyup", "handleBackdropKeyUp"]]]]]], options);
    });
};
export { defineCustomElements };
