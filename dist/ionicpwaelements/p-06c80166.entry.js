import{r as t,c as e,h as i,g as s}from"./p-918d051a.js";const h=class{constructor(i){t(this,i),this.onPhoto=e(this,"onPhoto",7),this.noDeviceError=e(this,"noDeviceError",7),this.facingMode="user",this.noDevicesText="No camera found",this.noDevicesButtonText="Choose image",this.handlePhoto=async t=>{this.onPhoto.emit(t)},this.handleNoDeviceError=async t=>{this.noDeviceError.emit(t)},this.handleOnRotate=()=>{this.el.rotate()},this.handleOnCapture=()=>{this.el.capture()}}handleBackdropClick(t){t.target!==this.el&&this.onPhoto.emit(null)}handleComponentClick(t){t.stopPropagation()}handleBackdropKeyUp(t){"Escape"===t.key&&this.onPhoto.emit(null)}render(){return i("div",{class:"wrapper",onClick:t=>this.handleBackdropClick(t)},i("div",{class:"content"},i("pwa-camera",{emballageImage:this.emballageImage,onClick:t=>this.handleComponentClick(t),facingMode:this.facingMode,handlePhoto:this.handlePhoto,handleOnRotate:this.handleOnRotate,handleOnCapture:this.handleOnCapture,handleNoDeviceError:this.handleNoDeviceError,noDevicesButtonText:this.noDevicesButtonText,noDevicesText:this.noDevicesText})))}get el(){return s(this)}};h.style=":host{z-index:1000;position:fixed;top:0;left:0;width:100%;height:100%;display:-ms-flexbox;display:flex;contain:strict;--inset-width:600px;--inset-height:600px}.wrapper{-ms-flex:1;flex:1;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;background-color:rgba(0, 0, 0, 0.15)}.content{-webkit-box-shadow:0px 0px 5px rgba(0, 0, 0, 0.2);box-shadow:0px 0px 5px rgba(0, 0, 0, 0.2);width:var(--inset-width);height:var(--inset-height);max-height:100%}@media only screen and (max-width: 600px){.content{width:100%;height:100%}}";export{h as pwa_camera_modal_instance}