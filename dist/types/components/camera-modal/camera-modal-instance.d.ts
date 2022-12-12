import { EventEmitter } from '../../stencil-public-runtime';
export declare class PWACameraModal {
    el: any;
    onPhoto: EventEmitter;
    noDeviceError: EventEmitter;
    facingMode: string;
    noDevicesText: string;
    noDevicesButtonText: string;
    emballageImage: any;
    handlePhoto: (photo: Blob) => Promise<void>;
    handleNoDeviceError: (photo: any) => Promise<void>;
    handleOnRotate: () => void;
    handleOnCapture: () => void;
    handleBackdropClick(e: MouseEvent): void;
    handleComponentClick(e: MouseEvent): void;
    handleBackdropKeyUp(e: KeyboardEvent): void;
    render(): any;
}
