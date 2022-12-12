import { h, Event, EventEmitter, Component, Method, Prop } from '@stencil/core';

@Component({
  tag: 'pwa-camera-modal',
  styleUrl: 'camera-modal.css',
  shadow: true
})
export class PWACameraModal {
  @Prop() facingMode: string = 'user';
  @Prop() emballageImage;

  @Event() onPhoto: EventEmitter;
  @Event() noDeviceError: EventEmitter;
  @Event() onRotate: EventEmitter;
  @Event() onCapture: EventEmitter;


  _modal: HTMLElement;

  @Method()
  async present() {
    const camera = document.createElement('pwa-camera-modal-instance');
    camera.facingMode = this.facingMode;
    camera.emballageImage = this.emballageImage;

    camera.addEventListener('onPhoto', async (e: any) => {
      if (!this._modal) {
        return;
      }
      const photo = e.detail;
      this.onPhoto.emit(photo);
    });

    camera.addEventListener('noDeviceError', async (e: any) => {
      this.noDeviceError.emit(e);
    });

    camera.addEventListener('onRotate', async (e: any) => {
      this.onRotate.emit(e);
    });
    camera.addEventListener('onCapture', async (e: any) => {
      this.onCapture.emit(e);
    });

    document.body.append(camera);

    this._modal = camera;
  }

  @Method()
  async dismiss() {
    if (!this._modal) { return; }
    this._modal && this._modal.parentNode.removeChild(this._modal);
    this._modal = null;
  }

  render() {
    return (<div></div>);
  }
}
