import { EventEmitter } from '../../stencil-public-runtime';
export declare class PWACameraModal {
    facingMode: string;
    emballageImage: any;
    onPhoto: EventEmitter;
    noDeviceError: EventEmitter;
    onRotate: EventEmitter;
    onCapture: EventEmitter;
    _modal: HTMLElement;
    present(): Promise<void>;
    dismiss(): Promise<void>;
    render(): any;
}
