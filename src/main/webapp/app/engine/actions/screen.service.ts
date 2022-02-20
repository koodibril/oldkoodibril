import { ILoadingScreen } from '@babylonjs/core';

export class CustomLoadingScreen implements ILoadingScreen {
  public loadingUIBackgroundColor: string;
  private _loadingDiv!: HTMLDivElement;
  constructor(public loadingUIText: string) {
    this.loadingUIBackgroundColor = 'black';
  }
  public displayLoadingUI(): void {
    if (document.getElementById('customLoadingScreenDiv')) {
      // Do not add a loading screen if there is already one
      document.getElementById('customLoadingScreenDiv')!.style.display = 'initial';
      return;
    }
    this._loadingDiv = document.createElement('div');
    this._loadingDiv.id = 'customLoadingScreenDiv';
    this._loadingDiv.innerHTML = 'scene is currently loading';
    const customLoadingScreenCss = document.createElement('style');
    customLoadingScreenCss.type = 'text/css';
    customLoadingScreenCss.innerHTML = `
        #customLoadingScreenDiv{
            background-color: #BB464Bcc;
            color: white;
            font-size:50px;
            text-align:center;
        }
        `;
    document.getElementsByTagName('head')[0].appendChild(customLoadingScreenCss);
    document.body.appendChild(this._loadingDiv);
  }

  public hideLoadingUI(): void {
    document.getElementById('customLoadingScreenDiv')!.style.display = 'none';
    console.log('scene is now loaded');
  }
}
