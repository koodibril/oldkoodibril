/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import { ILoadingScreen, Nullable } from '@babylonjs/core';

/**
 * Interface used to present a loading screen while loading a scene
 * @see https://doc.babylonjs.com/how_to/creating_a_custom_loading_screen
 */

/**
 * Class used for the default loading screen
 * @see https://doc.babylonjs.com/how_to/creating_a_custom_loading_screen
 */
export class CustomLoadingScreen implements ILoadingScreen {
  /** Gets or sets the logo url to use for the default loading screen */
  public static DefaultLogoUrl = '';

  /** Gets or sets the spinner url to use for the default loading screen */
  public static DefaultSpinnerUrl = '';
  private _loadingDiv!: Nullable<HTMLDivElement>;
  private _loadingTextDiv!: HTMLDivElement;
  private _style!: Nullable<HTMLStyleElement>;
  private imgBack!: HTMLImageElement;
  private imageSpinnerContainer!: HTMLElement;

  /**
   * Creates a new default loading screen
   * @param _renderingCanvas defines the canvas used to render the scene
   * @param _loadingText defines the default text to display
   * @param _loadingDivBackgroundColor defines the default background color
   */
  constructor(
    private _renderingCanvas: HTMLCanvasElement,
    private _loadingText = 'Loading',
    private _loadingDivBackgroundColor = 'black'
  ) {}

  /**
   * Function called to display the loading screen
   */
  public displayLoadingUI(): void {
    if (this._loadingDiv) {
      // Do not add a loading screen if there is already one
      return;
    }

    this._loadingDiv = document.createElement('div');

    this._loadingDiv.id = 'babylonjsLoadingDiv';
    this._loadingDiv.style.opacity = '0';
    this._loadingDiv.style.position = 'fixed';
    this._loadingDiv.style.transition = 'opacity 1.5s ease';
    this._loadingDiv.style.display = 'grid';
    this._loadingDiv.style.gridTemplateRows = '100%';
    this._loadingDiv.style.gridTemplateColumns = '100%';
    this._loadingDiv.style.justifyItems = 'center';
    this._loadingDiv.style.alignItems = 'center';
    this._loadingDiv.style.zIndex = '10';

    // Loading text
    this._loadingTextDiv = document.createElement('div');
    this._loadingTextDiv.style.position = 'absolute';
    this._loadingTextDiv.style.left = '0';
    this._loadingTextDiv.style.top = '0';
    this._loadingTextDiv.style.marginTop = '80px';
    this._loadingTextDiv.style.width = '100%';
    this._loadingTextDiv.style.fontFamily = 'Tommy';
    this._loadingTextDiv.style.fontSize = '50px';
    this._loadingTextDiv.style.color = 'white';
    this._loadingTextDiv.style.textAlign = 'center';
    this._loadingTextDiv.style.zIndex = '10';
    this._loadingTextDiv.innerHTML = 'Loading';

    this._loadingDiv.appendChild(this._loadingTextDiv);

    // set the predefined text
    this._loadingTextDiv.innerHTML = this._loadingText;

    // Generating keyframes
    this._style = document.createElement('style');
    this._style.type = 'text/css';
    const keyFrames = `@-webkit-keyframes spin1 {\
                    0% { -webkit-transform: rotate(0deg);}
                    100% { -webkit-transform: rotate(360deg);}
                }\
                @keyframes spin1 {\
                    0% { transform: rotate(0deg);}
                    100% { transform: rotate(360deg);}
                }`;
    this._style.innerHTML = keyFrames;
    document.getElementsByTagName('head')[0].appendChild(this._style);

    const svgSupport = !!window.SVGSVGElement;
    // Loading img
    this.imgBack = new Image();
    if (!CustomLoadingScreen.DefaultLogoUrl) {
      this.imgBack.src = !svgSupport
        ? 'https://cdn.babylonjs.com/Assets/babylonLogo.png'
        : `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxODAuMTcgMjA4LjA0Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6I2ZmZjt9LmNscy0ye2ZpbGw6I2UwNjg0Yjt9LmNscy0ze2ZpbGw6I2JiNDY0Yjt9LmNscy00e2ZpbGw6I2UwZGVkODt9LmNscy01e2ZpbGw6I2Q1ZDJjYTt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPkJhYnlsb25Mb2dvPC90aXRsZT48ZyBpZD0iTGF5ZXJfMiIgZGF0YS1uYW1lPSJMYXllciAyIj48ZyBpZD0iUGFnZV9FbGVtZW50cyIgZGF0YS1uYW1lPSJQYWdlIEVsZW1lbnRzIj48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik05MC4wOSwwLDAsNTJWMTU2bDkwLjA5LDUyLDkwLjA4LTUyVjUyWiIvPjxwb2x5Z29uIGNsYXNzPSJjbHMtMiIgcG9pbnRzPSIxODAuMTcgNTIuMDEgMTUxLjk3IDM1LjczIDEyNC44NSA1MS4zOSAxNTMuMDUgNjcuNjcgMTgwLjE3IDUyLjAxIi8+PHBvbHlnb24gY2xhc3M9ImNscy0yIiBwb2ludHM9IjI3LjEyIDY3LjY3IDExNy4yMSAxNS42NiA5MC4wOCAwIDAgNTIuMDEgMjcuMTIgNjcuNjciLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iNjEuODkgMTIwLjMgOTAuMDggMTM2LjU4IDExOC4yOCAxMjAuMyA5MC4wOCAxMDQuMDIgNjEuODkgMTIwLjMiLz48cG9seWdvbiBjbGFzcz0iY2xzLTMiIHBvaW50cz0iMTUzLjA1IDY3LjY3IDE1My4wNSAxNDAuMzcgOTAuMDggMTc2LjcyIDI3LjEyIDE0MC4zNyAyNy4xMiA2Ny42NyAwIDUyLjAxIDAgMTU2LjAzIDkwLjA4IDIwOC4wNCAxODAuMTcgMTU2LjAzIDE4MC4xNyA1Mi4wMSAxNTMuMDUgNjcuNjciLz48cG9seWdvbiBjbGFzcz0iY2xzLTMiIHBvaW50cz0iOTAuMDggNzEuNDYgNjEuODkgODcuNzQgNjEuODkgMTIwLjMgOTAuMDggMTA0LjAyIDExOC4yOCAxMjAuMyAxMTguMjggODcuNzQgOTAuMDggNzEuNDYiLz48cG9seWdvbiBjbGFzcz0iY2xzLTQiIHBvaW50cz0iMTUzLjA1IDY3LjY3IDExOC4yOCA4Ny43NCAxMTguMjggMTIwLjMgOTAuMDggMTM2LjU4IDkwLjA4IDE3Ni43MiAxNTMuMDUgMTQwLjM3IDE1My4wNSA2Ny42NyIvPjxwb2x5Z29uIGNsYXNzPSJjbHMtNSIgcG9pbnRzPSIyNy4xMiA2Ny42NyA2MS44OSA4Ny43NCA2MS44OSAxMjAuMyA5MC4wOCAxMzYuNTggOTAuMDggMTc2LjcyIDI3LjEyIDE0MC4zNyAyNy4xMiA2Ny42NyIvPjwvZz48L2c+PC9zdmc+`;
    } else {
      this.imgBack.src = CustomLoadingScreen.DefaultLogoUrl;
    }

    this.imgBack.style.width = '150px';
    this.imgBack.style.gridColumn = '1';
    this.imgBack.style.gridRow = '1';
    this.imgBack.style.top = '50%';
    this.imgBack.style.left = '50%';
    this.imgBack.style.transform = 'translate(-50%, -50%)';
    this.imgBack.style.position = 'absolute';

    this.imageSpinnerContainer = document.createElement('div');
    this.imageSpinnerContainer.style.width = '300px';
    this.imageSpinnerContainer.style.gridColumn = '1';
    this.imageSpinnerContainer.style.gridRow = '1';
    this.imageSpinnerContainer.style.top = '50%';
    this.imageSpinnerContainer.style.left = '50%';
    this.imageSpinnerContainer.style.transform = 'translate(-50%, -50%)';
    this.imageSpinnerContainer.style.position = 'absolute';
    this.imageSpinnerContainer.style.zIndex = '10';

    // Loading spinner
    const imgSpinner = new Image();

    if (!CustomLoadingScreen.DefaultSpinnerUrl) {
      imgSpinner.src = !svgSupport
        ? 'https://cdn.babylonjs.com/Assets/loadingIcon.png'
        : `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzOTIgMzkyIj48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6I2UwNjg0Yjt9LmNscy0ye2ZpbGw6bm9uZTt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPlNwaW5uZXJJY29uPC90aXRsZT48ZyBpZD0iTGF5ZXJfMiIgZGF0YS1uYW1lPSJMYXllciAyIj48ZyBpZD0iU3Bpbm5lciI+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNDAuMjEsMTI2LjQzYzMuNy03LjMxLDcuNjctMTQuNDQsMTItMjEuMzJsMy4zNi01LjEsMy41Mi01YzEuMjMtMS42MywyLjQxLTMuMjksMy42NS00LjkxczIuNTMtMy4yMSwzLjgyLTQuNzlBMTg1LjIsMTg1LjIsMCwwLDEsODMuNCw2Ny40M2EyMDgsMjA4LDAsMCwxLDE5LTE1LjY2YzMuMzUtMi40MSw2Ljc0LTQuNzgsMTAuMjUtN3M3LjExLTQuMjgsMTAuNzUtNi4zMmM3LjI5LTQsMTQuNzMtOCwyMi41My0xMS40OSwzLjktMS43Miw3Ljg4LTMuMywxMi00LjY0YTEwNC4yMiwxMDQuMjIsMCwwLDEsMTIuNDQtMy4yMyw2Mi40NCw2Mi40NCwwLDAsMSwxMi43OC0xLjM5QTI1LjkyLDI1LjkyLDAsMCwxLDE5NiwyMS40NGE2LjU1LDYuNTUsMCwwLDEsMi4wNSw5LDYuNjYsNi42NiwwLDAsMS0xLjY0LDEuNzhsLS40MS4yOWEyMi4wNywyMi4wNywwLDAsMS01Ljc4LDMsMzAuNDIsMzAuNDIsMCwwLDEtNS42NywxLjYyLDM3LjgyLDM3LjgyLDAsMCwxLTUuNjkuNzFjLTEsMC0xLjkuMTgtMi44NS4yNmwtMi44NS4yNHEtNS43Mi41MS0xMS40OCwxLjFjLTMuODQuNC03LjcxLjgyLTExLjU4LDEuNGExMTIuMzQsMTEyLjM0LDAsMCwwLTIyLjk0LDUuNjFjLTMuNzIsMS4zNS03LjM0LDMtMTAuOTQsNC42NHMtNy4xNCwzLjUxLTEwLjYsNS41MUExNTEuNiwxNTEuNiwwLDAsMCw2OC41Niw4N0M2Ny4yMyw4OC40OCw2Niw5MCw2NC42NCw5MS41NnMtMi41MSwzLjE1LTMuNzUsNC43M2wtMy41NCw0LjljLTEuMTMsMS42Ni0yLjIzLDMuMzUtMy4zMyw1YTEyNywxMjcsMCwwLDAtMTAuOTMsMjEuNDksMS41OCwxLjU4LDAsMSwxLTMtMS4xNVM0MC4xOSwxMjYuNDcsNDAuMjEsMTI2LjQzWiIvPjxyZWN0IGNsYXNzPSJjbHMtMiIgd2lkdGg9IjM5MiIgaGVpZ2h0PSIzOTIiLz48L2c+PC9nPjwvc3ZnPg==`;
    } else {
      imgSpinner.src = CustomLoadingScreen.DefaultSpinnerUrl;
    }

    imgSpinner.style.animation = 'spin1 0.75s infinite linear';
    imgSpinner.style.webkitAnimation = 'spin1 0.75s infinite linear';
    imgSpinner.style.transformOrigin = '50% 50%';
    imgSpinner.style.webkitTransformOrigin = '50% 50%';

    if (!svgSupport) {
      const logoSize = { w: 16, h: 18.5 };
      const loadingSize = { w: 30, h: 30 };
      // set styling correctly
      this.imgBack.style.width = `${logoSize.w}vh`;
      this.imgBack.style.height = `${logoSize.h}vh`;
      this.imgBack.style.left = `calc(50% - ${logoSize.w / 2}vh)`;
      this.imgBack.style.top = `calc(50% - ${logoSize.h / 2}vh)`;

      imgSpinner.style.width = `${loadingSize.w}vh`;
      imgSpinner.style.height = `${loadingSize.h}vh`;
      imgSpinner.style.left = `calc(50% - ${loadingSize.w / 2}vh)`;
      imgSpinner.style.top = `calc(50% - ${loadingSize.h / 2}vh)`;
    }

    this.imageSpinnerContainer.appendChild(imgSpinner);

    this._loadingDiv.appendChild(this.imgBack);
    this._loadingDiv.appendChild(this.imageSpinnerContainer);

    this._resizeLoadingUI();

    window.addEventListener('resize', this._resizeLoadingUI);

    this._loadingDiv.style.backgroundColor = this._loadingDivBackgroundColor;
    document.body.appendChild(this._loadingDiv);

    this._loadingDiv.style.opacity = '1';
  }

  public test(): void {
    const div = document.getElementById('babylonjsLoadingDiv');
    document.body.requestFullscreen();
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
        navigator.userAgent
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
        navigator.userAgent.substr(0, 4)
      )
    ) {
      window.screen.orientation.lock('landscape-primary').then(
        success => console.log(success),
        failure => console.log(failure)
      );
    }
    div?.parentElement?.removeChild(div);
  }

  public readyUIDiv(): void {
    let mobile = false;
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
        navigator.userAgent
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
        navigator.userAgent.substr(0, 4)
      )
    ) {
      mobile = true;
    }
    this._loadingDiv!.removeChild(this.imgBack);
    this._loadingDiv!.removeChild(this.imageSpinnerContainer);
    const test = document.createElement('button');
    test.innerHTML = 'Click me';
    test.style.height = '150px';
    test.style.width = '150px';
    test.style.fontFamily = 'Tommy';
    test.style.fontSize = '25px';
    test.style.color = 'white';
    test.style.backgroundColor = 'rgb(49, 54, 63, 0.7)';
    test.style.border = 'none';
    test.style.borderRadius = '75px';
    test.style.gridColumn = '1';
    test.style.gridRow = '1';
    test.style.top = '50%';
    test.style.left = '50%';
    test.style.transform = 'translate(-50%, -50%)';
    test.style.position = 'absolute';
    test.style.zIndex = '10';
    test.onclick = this.test;

    const subleft = document.createElement('div');
    const imgleft = new Image();
    subleft.style.gridColumn = '1';
    subleft.style.gridRow = '1';
    subleft.style.top = '29%';
    subleft.style.left = '50%';
    subleft.style.transform = 'translate(-50%, -29%)';
    subleft.style.position = 'absolute';
    subleft.style.fontFamily = 'Tommy';
    subleft.style.fontSize = '25px';
    subleft.style.color = 'white';
    subleft.style.textAlign = 'center';
    imgleft.style.width = '100px';
    imgleft.style.fill = 'white';
    imgleft.style.gridColumn = '1';
    imgleft.style.gridRow = '1';
    imgleft.style.top = '18%';
    imgleft.style.left = '50%';
    imgleft.style.transform = 'translate(-50%, -18%)';
    imgleft.style.position = 'absolute';
    if (mobile) {
      subleft.innerHTML = 'Double tap to<br>select a project';
      imgleft.src = '../../content/images/DoubleTap.svg';
    } else {
      subleft.innerHTML = 'Click to<br>select a project';
      imgleft.src = '../../content/images/Tap.svg';
    }

    const subright = document.createElement('div');
    subright.innerHTML = 'Scroll to<br>change project';
    subright.style.gridColumn = '1';
    subright.style.gridRow = '1';
    subright.style.top = '86%';
    subright.style.left = '50%';
    subright.style.transform = 'translate(-50%, -86%)';
    subright.style.position = 'absolute';
    subright.style.fontFamily = 'Tommy';
    subright.style.fontSize = '25px';
    subright.style.color = 'white';
    subright.style.textAlign = 'center';
    const imgright = new Image();
    imgright.src = '../../content/images/Scroll-Vertical.svg';
    imgright.style.width = '100px';
    imgright.style.fill = 'white';
    imgright.style.gridColumn = '1';
    imgright.style.gridRow = '1';
    imgright.style.top = '75%';
    imgright.style.left = '50%';
    imgright.style.transform = 'translate(-50%, -75%)';
    imgright.style.position = 'absolute';

    // if (mobile) {
    //   // for now mobile isn't supported, let's say that.
    //   subright.style.top = '50%';
    //   subright.style.transform = 'translate(-50%, -50%)';
    //   subright.style.fontSize = '25px';
    //   subright.innerHTML = 'Mobile are not supported yet.<br>Please, visit on desktop for <br> a full portfolio';
    //   this._loadingDiv?.appendChild(subright);
    // } else {
    this._loadingDiv?.appendChild(test);
    this._loadingDiv?.appendChild(imgleft);
    this._loadingDiv?.appendChild(subleft);
    this._loadingDiv?.appendChild(imgright);
    this._loadingDiv?.appendChild(subright);
    // }
  }

  /**
   * Function called to hide the loading screen
   */
  public hideLoadingUI(): void {
    if (!this._loadingDiv) {
      return;
    }

    const onTransitionEnd = (): void => {
      if (this._loadingDiv) {
        if (this._loadingDiv.parentElement) {
          this._loadingDiv.parentElement.removeChild(this._loadingDiv);
        }
        this._loadingDiv = null;
      }
      if (this._style) {
        if (this._style.parentElement) {
          this._style.parentElement.removeChild(this._style);
        }
        this._style = null;
      }
      window.removeEventListener('resize', this._resizeLoadingUI);
    };

    this._loadingDiv.style.opacity = '0';
    this._loadingDiv.addEventListener('transitionend', onTransitionEnd);
  }

  /**
   * Gets or sets the text to display while loading
   */
  public set loadingUIText(text: string) {
    this._loadingText = text;

    if (this._loadingTextDiv) {
      this._loadingTextDiv.innerHTML = this._loadingText;
      if (text === '') {
        this.readyUIDiv();
      }
    }
  }

  public get loadingUIText(): string {
    return this._loadingText;
  }

  /**
   * Gets or sets the color to use for the background
   */
  public get loadingUIBackgroundColor(): string {
    return this._loadingDivBackgroundColor;
  }

  public set loadingUIBackgroundColor(color: string) {
    this._loadingDivBackgroundColor = color;

    if (!this._loadingDiv) {
      return;
    }

    this._loadingDiv.style.backgroundColor = this._loadingDivBackgroundColor;
  }

  // Resize
  private _resizeLoadingUI = (): void => {
    const canvasRect = this._renderingCanvas.getBoundingClientRect();
    const canvasPositioning = window.getComputedStyle(this._renderingCanvas).position;

    if (!this._loadingDiv) {
      return;
    }

    this._loadingDiv.style.position = canvasPositioning === 'fixed' ? 'fixed' : 'absolute';
    this._loadingDiv.style.left = canvasRect.left.toString() + 'px';
    this._loadingDiv.style.top = canvasRect.top.toString() + 'px';
    this._loadingDiv.style.width = canvasRect.width.toString() + 'px';
    this._loadingDiv.style.height = canvasRect.height.toString() + 'px';
  };
}
