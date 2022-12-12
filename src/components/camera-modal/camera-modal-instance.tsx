import { h, Event, EventEmitter, Component, Listen, Element, Prop } from '@stencil/core';

@Component({
  tag: 'pwa-camera-modal-instance',
  styleUrl: 'camera-modal-instance.css',
  shadow: true
})
export class PWACameraModal {
  @Element() el;
  @Event() onPhoto: EventEmitter;
  @Event() noDeviceError: EventEmitter;
  @Prop() facingMode: string = 'user';
  @Prop() noDevicesText = 'No camera found';
  @Prop() noDevicesButtonText = 'Choose image';
  @Prop() emballageImage;

  handlePhoto = async (photo: Blob) => {
    this.onPhoto.emit(photo);
  }

  handleNoDeviceError = async (photo: any) => {
    this.noDeviceError.emit(photo);
  }

  handleOnRotate = () => {
    this.el.rotate();
  }

  handleOnCapture = () => {
    this.el.capture();
  }

  handleBackdropClick(e: MouseEvent) {
    if (e.target !== this.el) {
      this.onPhoto.emit(null);
    }
  }

  handleComponentClick(e: MouseEvent) {
    e.stopPropagation();
  }

  @Listen('keyup', { target: 'body' })
  handleBackdropKeyUp(e: KeyboardEvent) {
    if (e.key === "Escape") {
      this.onPhoto.emit(null);
    }
  }

  render() {
    return (
      <div class="wrapper" onClick={e => this.handleBackdropClick(e)}>
        <div class="content">
          <pwa-camera
            emballageImage={this.emballageImage}
            onClick={e => this.handleComponentClick(e)}
            facingMode={this.facingMode}
            handlePhoto={this.handlePhoto}
            handleOnRotate={this.handleOnRotate}
            handleOnCapture={this.handleOnCapture}
            handleNoDeviceError={this.handleNoDeviceError}
            noDevicesButtonText={this.noDevicesButtonText}
            noDevicesText={this.noDevicesText} />
        </div>
      </div>
    );
  }
}
