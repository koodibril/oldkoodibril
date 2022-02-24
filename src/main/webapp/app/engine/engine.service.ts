import { WindowRefService } from './../services/window-ref.service';
import { ElementRef, Injectable, NgZone } from '@angular/core';
import { Engine, Scene, MeshBuilder, Color4, Vector3, Color3, FlyCamera, PointerEventTypes, Matrix } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { GridMaterial } from '@babylonjs/materials';
import { ForestActions, Forest } from './actions/forest.service';
import { LightsActions, Lights } from './actions/lights.service';
import { AnimationsActions, Koodibril } from './actions/animations.service';
import { GuiActions } from './actions/gui.service';
import { textActions } from './actions/text.service';
import { BehaviorSubject } from 'rxjs';
import { pannelInfo } from './engine.component';
import { CustomLoadingScreen } from './actions/screen.service';

@Injectable({ providedIn: 'root' })
export class EngineService {
  public loading: boolean;
  public appName = new BehaviorSubject<pannelInfo>({ app: '', side: false });
  public loadingState = new BehaviorSubject<string>('h');
  // the canvas is where our scene is loaded
  private canvas!: HTMLCanvasElement;
  // the babylon engine
  private engine!: Engine;
  // the camera from where we see the scene
  private camera!: FlyCamera;
  // the scene where we will load our models
  private scene!: Scene;
  // true if we are sliding
  private move!: boolean;
  // true if there is already a timeout running
  private timeout!: boolean;
  // true if the flower is opened
  private open!: boolean;
  // last value of touching screen on Y axis (for scrolling in phone)
  private touchY!: number;
  // device type, 2 === pc, 3 === phone
  private device!: number;
  // store all mesh of the forest
  private forest!: Forest;
  // class that oversee the forests loading, and add/delete rows
  private forestActions!: ForestActions;
  // store all light related value
  private lights!: Lights;
  // class that oversee the lights loading, and change their values for day/night
  private lightsAction!: LightsActions;
  private koodibril!: Koodibril;
  private animationsActions!: AnimationsActions;
  private guiAction!: GuiActions;
  private textActions!: textActions;
  private position!: number;

  public constructor(private ngZone: NgZone, private windowRef: WindowRefService) {
    this.loading = false;
  }

  // instantiate everything in the scene, take canvas for rendering
  public async createScene(canvas: ElementRef<HTMLCanvasElement>): Promise<void> {
    this.canvas = canvas.nativeElement;
    this.move = false;

    this.engine = new Engine(this.canvas, true);
    const loadingScreen = new CustomLoadingScreen(this.canvas);
    this.engine.loadingScreen = loadingScreen;
    this.engine.displayLoadingUI();
    this.engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
    this.loadingState.subscribe(value => {
      this.engine.loadingUIText = value;
    });

    this.loadingState.next('Creating scene');
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(1, 1, 1, 1); // set the color of the void
    this.scene.ambientColor = new Color3(1, 1, 1); // set the ambiant color, don't seem to affect object
    this.scene.fogMode = Scene.FOGMODE_LINEAR;
    this.scene.fogStart = 4.0;
    this.scene.fogEnd = 20.0;
    this.scene.fogColor = new Color3(1, 1, 1); // set the color of the fog

    this.camera = new FlyCamera('camera1', new Vector3(0, 3, -5), this.scene);

    this.camera.setTarget(new Vector3(0, 2, 0));
    this.lightsAction = new LightsActions(this.scene, this.camera, this.engine);
    this.lightsAction.instantiateLights();
    this.lights = this.lightsAction.lights;

    this.loadingState.next('Creating ground');
    const ground = MeshBuilder.CreateGround('ground', { width: 300, height: 300 });
    this.lights.groundLight = new GridMaterial('groundMat', this.scene);
    this.lights.groundLight.majorUnitFrequency = 20;
    this.lights.groundLight.gridOffset = new Vector3(0, 0, 4);
    this.lights.groundLight.mainColor = new Color3(1, 1, 1);
    this.lights.groundLight.lineColor = new Color3(0, 0, 0);
    ground.material = this.lights.groundLight;
    ground.material.backFaceCulling = false;
    ground.checkCollisions = true;

    this.loadingState.next('Creating Forest');
    this.forestActions = new ForestActions(this.scene, this.loadingState);
    await this.forestActions.instantiateForest();
    this.forest = this.forestActions.forest;

    this.loadingState.next('Loading animations');
    this.animationsActions = new AnimationsActions(this.scene, this.forest);
    await this.animationsActions.initiateAnimation();
    this.koodibril = this.animationsActions.koodibril;

    this.textActions = new textActions(this.scene, this.canvas, this.appName);

    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
        navigator.userAgent
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
        navigator.userAgent.substr(0, 4)
      )
    ) {
      this.device = 2;
      // this.camera.position = new Vector3(0, 4, -7);
    } else {
      this.device = 1;
    }

    this.timeout = false;
    this.open = false;
    this.position = 0;
    this.loadingState.next('');
    this.engine.loadingUIBackgroundColor = 'rgb(1, 1, 1, 0.7)';
    // this.canvas.requestFullscreen();
    // this.canvas.click();
  }

  // this class use vertex to get the position on canvas in px of an object rendered
  public getPos(x: number, y: number): void {
    const temp = new Vector3();
    const vertices = this.textActions.bottomText.getBoundingInfo().boundingBox.vectorsWorld;
    const viewport = this.camera.viewport.toGlobal(this.engine.getRenderWidth(), this.engine.getRenderHeight());
    let minX = 1e10,
      minY = 1e10,
      maxX = -1e10,
      maxY = -1e10;
    for (const vertex of vertices) {
      Vector3.ProjectToRef(vertex, Matrix.IdentityReadOnly, this.scene.getTransformMatrix(), viewport, temp);

      if (minX > temp.x) {
        minX = temp.x;
      }
      if (maxX < temp.x) {
        maxX = temp.x;
      }
      if (minY > temp.y) {
        minY = temp.y;
      }
      if (maxY < temp.y) {
        maxY = temp.y;
      }
    }
    const ofstX = this.canvas.offsetLeft,
      ofstY = this.canvas.offsetTop;
    // const htmlElem = document.getElementById('htlmElem');
    // htmlElem.style.left = (minX + ofstX) + "px";
    // htmlElem.style.top = (minY + ofstY) + "px";    for testing purpose
    // htmlElem.style.width = (maxX - minX) + "px";
    // htmlElem.style.height = (maxY - minY) + "px";
    const left = minX + ofstX;
    const top = minY + ofstY;
    const width = maxX - minX + left;
    const height = maxY - minY + top;
    if (x < left || x > width || y < top || y > height) {
      this.opener(0, 0);
    }
  }

  // class that is called outside of the rendering for listeners
  public animate(): void {
    this.ngZone.runOutsideAngular(() => {
      const rendererLoopCallback = (): void => {
        this.scene.render();
      };

      if (this.windowRef.document.readyState !== 'loading') {
        this.engine.runRenderLoop(rendererLoopCallback);
      } else {
        this.windowRef.window.addEventListener('DOMContentLoaded', () => {
          this.engine.runRenderLoop(rendererLoopCallback);
        });
      }

      // observable for scroll, click and doubleclick
      this.scene.onPointerObservable.add(pointerInfo => {
        switch (pointerInfo.type) {
          case PointerEventTypes.POINTERMOVE:
            break;
          case PointerEventTypes.POINTERWHEEL:
            this.wheel(pointerInfo.event);
            break;
          case PointerEventTypes.POINTERTAP:
            if (!this.move && !this.loading && this.device === 1) {
              if (this.open) {
                this.getPos(pointerInfo.event.clientX, pointerInfo.event.clientY);
              } else {
                this.opener(this.forest.flowers.front.meshe.position.x, this.forest.flowers.front.meshe.position.y);
              }
            }
            break;
          case PointerEventTypes.POINTERDOUBLETAP:
            if (!this.move && !this.loading && this.device === 2) {
              if (this.open) {
                this.opener(0, 0);
              } else {
                this.opener(this.forest.flowers.front.meshe.position.x, this.forest.flowers.front.meshe.position.y);
              }
            }
            break;
        }
      });

      // observable for scroll in phone
      this.canvas.addEventListener('touchstart', event => {
        this.touchY = event.touches[0].clientY;
      });
      this.canvas.addEventListener('touchend', event => {
        const test = <any>{};
        const currentY = event.changedTouches[0].clientY;
        if (currentY > this.touchY && currentY - this.touchY > 50) {
          test.deltaY = -1;
          this.wheel(test);
        } else if (currentY < this.touchY && currentY - this.touchY < -50) {
          test.deltaY = 1;
          this.wheel(test);
        }
      });

      // this will resize the scene if the canvas is resized
      this.windowRef.window.addEventListener('resize', () => {
        this.engine.resize();
      });
      // this will resize the scene if the phone change orientation
      this.windowRef.window.addEventListener('orientationchange', () => {
        this.engine.resize();
      });
    });
  }

  // reset the position of the colibri at the center of the screen
  public reset(): void {
    this.koodibril.lastFly.stop();
    this.koodibril.lastFly.onAnimationEndObservable.clear();
    if (this.open) {
      this.animationsActions.retract_fast_flower();
      this.animationsActions.retract_tree();
      this.animationsActions.retract_bush();
      this.animationsActions.retract_pannel();
      this.textActions.bottomText.dispose();
      this.textActions.middleText.dispose();
      this.textActions.topText.dispose();
      this.open = false;
    }
    this.koodibril.animation[1].stop();
    this.koodibril.animation[0].start(true, 10);
    this.animationsActions.slideObject(
      this.koodibril.mesh,
      this.koodibril.mesh.position,
      new Vector3(0, 2, this.koodibril.mesh.position.z),
      2
    );
    this.animationsActions.fly();
    this.loading = false;
  }

  // not used anymore, allow the colibri to follow the cursor,
  // a little off because the colibri move on x and y with z=0 but the camera is
  // at y = 3 for dof, so the calculations is approximative
  public onMove(): void {
    if (!this.animationsActions.loading) {
      this.koodibril.lastFly.stop();
      this.koodibril.lastFly.onAnimationEndObservable.clear();
      const offsetCanvasx = this.canvas.width / 200;
      const offsetCanvasy = this.canvas.height / 200;
      const x = (this.scene.pointerX / 100 - offsetCanvasx) / 2;
      const y = (-this.scene.pointerY / 100 + offsetCanvasy + 3) / 1.5;
      this.opener(x, y);
      if (!this.open) {
        if (this.koodibril.mesh.position.x > x && !this.koodibril.leftoright) {
          this.koodibril.mesh.rotate(new Vector3(0, 1, 0), Math.PI);
          this.koodibril.leftoright = true;
        }
        if (this.koodibril.mesh.position.x < x && this.koodibril.leftoright) {
          this.koodibril.mesh.rotate(new Vector3(0, 1, 0), Math.PI);
          this.koodibril.leftoright = false;
        }
        this.koodibril.mesh.position.x = x;
        this.koodibril.mesh.position.y = y;
      }
      if (!this.timeout) {
        this.timeout = true;
        setTimeout(() => {
          if (!this.open) {
            this.animationsActions.fly();
          }
          this.timeout = false;
        }, 2000);
      }
    }
  }

  // function that will add an animation to all mesh of the forest
  // sliding them frontward, or backward
  public wheel(event: any): void {
    this.appName.next({ app: 'wheel', side: false });
    const delta = Math.sign(event.deltaY);
    if (delta === 1) {
      this.position = this.position === 0 ? 23 : this.position - 1;
    } else {
      this.position = this.position === 24 ? 1 : this.position + 1;
    }
    if (this.position === 24) {
      this.position = 0;
    }
    if (this.open && !this.animationsActions.loading) {
      this.reset();
    }
    if (!this.move && !this.animationsActions.loading) {
      this.forestActions.addRow(delta);
      this.move = true;
      let rollOver: any;
      let toMove: any;
      this.lightsAction.day(delta);
      // this.device === 2 && this.guiAction.show ? this.refreshColorGui() : null;
      for (let i = 0; i < 12; i++) {
        switch (i) {
          case 0:
            toMove = this.forest.trees.front;
            break;
          case 1:
            toMove = this.forest.trees.middle;
            break;
          case 2:
            toMove = this.forest.trees.back;
            break;
          case 3:
            toMove = this.forest.trees.delete;
            break;
          case 4:
            toMove = this.forest.bushes.front;
            break;
          case 5:
            toMove = this.forest.bushes.middle;
            break;
          case 6:
            toMove = this.forest.bushes.back;
            break;
          case 7:
            toMove = this.forest.bushes.delete;
            break;
          case 8:
            toMove = [this.forest.flowers.front];
            break;
          case 9:
            toMove = [this.forest.flowers.middle];
            break;
          case 10:
            toMove = [this.forest.flowers.back];
            break;
          case 11:
            toMove = [this.forest.flowers.delete];
            break;
        }
        toMove.forEach((element: any) => {
          const position = element.meshe.position;
          if (element.meshe.position.z === 8 && delta === 1) {
            rollOver = this.animationsActions.slideObject(
              element.meshe,
              position,
              new Vector3(position.x, -5, (position.z as number) + 4 * delta),
              2
            );
          } else if (element.meshe.position.z === 12 && delta === -1) {
            rollOver = this.animationsActions.slideObject(
              element.meshe,
              position,
              new Vector3(position.x, element.meshe.name === 'flower' ? 1.5 : 0, (position.z as number) + 4 * delta),
              2
            );
          } else {
            rollOver = this.animationsActions.slideObject(
              element.meshe,
              position,
              new Vector3(position.x, position.y, (position.z as number) + 4 * delta),
              2
            );
          }
        });
      }
      rollOver!.onAnimationEndObservable.add(() => {
        this.move = false;
        this.open = false;
        this.forestActions.deleteRow();
      });
    }
  }

  // fonction that check if the flower can open (position of the colibri vs position of the flower)
  // will start all the animations relative to
  public opener(x: number, y: number): void {
    this.loading = true;
    const flowerPos = this.forest.flowers.front.meshe.position;
    const xOffsetr = flowerPos.x < 0 ? 0.5 : 0.1;
    const xOffsetl = flowerPos.x < 0 ? 0.1 : 0.5;
    if (flowerPos.x >= x - xOffsetr && flowerPos.x <= x + xOffsetl && flowerPos.y >= y - 0.5 && flowerPos.y <= y + 1 && !this.open) {
      this.koodibril.lastFly.stop();
      this.koodibril.lastFly.onAnimationEndObservable.clear();
      this.animationsActions.goToFlower();
      this.animationsActions.deploy_flower();
      this.animationsActions.deploy_bush();
      this.animationsActions.deploy_tree();
      this.animationsActions.deploy_pannel();
      setTimeout(() => {
        this.textActions.generateTopText(this.position);
      }, 150);
      setTimeout(() => {
        this.textActions.generateMiddleText(this.position);
      }, 250);
      setTimeout(() => {
        this.textActions.generateBottomText(this.position, flowerPos.x + (flowerPos.x < 0 ? 0.5 : -0.5) < 0);
        this.open = true;
        this.loading = false;
      }, 350);
    } else if (
      (flowerPos.x <= x - xOffsetr || flowerPos.x >= x + xOffsetl || flowerPos.y <= y - 0.5 || flowerPos.y >= y + 1) &&
      this.open
    ) {
      this.reset();
    }
  }

  // tried to change color of the forest on the forest on the run
  public refreshColorGui(): void {
    this.guiAction.reset();
    this.guiAction.instantiateColorGui();
    this.guiAction.createColorPannel('Sun', this.lights.sunMesh);
    this.guiAction.createPBRColorPannel('Bush', this.forest.bushes.front[0].color[0].subMeshes[0].getMesh(), false);
    this.guiAction.createPBRColorPannel('FlowerTop', this.forest.flowers.front.color[1].subMeshes[0].getMesh(), true);
    this.guiAction.createPBRColorPannel('FlowerBot', this.forest.flowers.front.color[2].subMeshes[0].getMesh(), true);
    this.guiAction.createTreeColorPannel('TreeBot', this.forest.trees, false);
    this.guiAction.createTreeColorPannel('TreeTop', this.forest.trees, true);
    this.guiAction.createFogColorPannel();
    this.guiAction.createAmbiantColorPannel();
  }
}
