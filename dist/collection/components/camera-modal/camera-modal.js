import { h, Event, Component, Method, Prop } from '@stencil/core';
export class PWACameraModal {
    constructor() {
        this.facingMode = 'user';
    }
    async present() {
        const camera = document.createElement('pwa-camera-modal-instance');
        camera.facingMode = this.facingMode;
        camera.emballageImage = this.emballageImage;
        camera.addEventListener('onPhoto', async (e) => {
            if (!this._modal) {
                return;
            }
            const photo = e.detail;
            this.onPhoto.emit(photo);
        });
        camera.addEventListener('noDeviceError', async (e) => {
            this.noDeviceError.emit(e);
        });
        camera.addEventListener('onRotate', async (e) => {
            this.onRotate.emit(e);
        });
        camera.addEventListener('onCapture', async (e) => {
            this.onCapture.emit(e);
        });
        document.body.append(camera);
        this._modal = camera;
    }
    async dismiss() {
        if (!this._modal) {
            return;
        }
        this._modal && this._modal.parentNode.removeChild(this._modal);
        this._modal = null;
    }
    render() {
        return (h("div", null));
    }
    static get is() { return "pwa-camera-modal"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["camera-modal.css"]
    }; }
    static get styleUrls() { return {
        "$": ["camera-modal.css"]
    }; }
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
    static get events() { return [{
            "method": "onPhoto",
            "name": "onPhoto",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": ""
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }, {
            "method": "noDeviceError",
            "name": "noDeviceError",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": ""
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }, {
            "method": "onRotate",
            "name": "onRotate",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": ""
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }, {
            "method": "onCapture",
            "name": "onCapture",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": ""
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }]; }
    static get methods() { return {
        "present": {
            "complexType": {
                "signature": "() => Promise<void>",
                "parameters": [],
                "references": {
                    "Promise": {
                        "location": "global"
                    }
                },
                "return": "Promise<void>"
            },
            "docs": {
                "text": "",
                "tags": []
            }
        },
        "dismiss": {
            "complexType": {
                "signature": "() => Promise<void>",
                "parameters": [],
                "references": {
                    "Promise": {
                        "location": "global"
                    }
                },
                "return": "Promise<void>"
            },
            "docs": {
                "text": "",
                "tags": []
            }
        }
    }; }
}
