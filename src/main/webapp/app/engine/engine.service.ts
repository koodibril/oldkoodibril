import { WindowRefService } from './../services/window-ref.service';
import { ElementRef, Injectable, NgZone } from '@angular/core';
import { Engine, Scene, MeshBuilder, Color4, Vector3, Color3, FlyCamera, PointerEventTypes, DeviceSourceManager } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { GridMaterial } from '@babylonjs/materials';
import { ForestActions, Forest } from './actions/forest.service';
import { LightsActions, Lights } from './actions/lights.service';
import { AnimationsActions, Koodibril } from './actions/animations.service';
import { GuiActions } from './actions/gui.service';

@Injectable({ providedIn: 'root' })
export class EngineService {
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

  public constructor(private ngZone: NgZone, private windowRef: WindowRefService) {}

  // instantiate everything in the scene, take canvas for rendering
  public async createScene(canvas: ElementRef<HTMLCanvasElement>): Promise<void> {
    this.canvas = canvas.nativeElement;
    this.move = false;

    this.engine = new Engine(this.canvas, true);
    this.engine.displayLoadingUI();

    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.9, 0.9, 0.85, 1);
    this.scene.ambientColor = new Color3(0.9, 0.9, 0.85);
    this.scene.fogMode = Scene.FOGMODE_LINEAR;
    this.scene.fogStart = 4.0;
    this.scene.fogEnd = 20.0;
    this.scene.fogColor = new Color3(0.9, 0.9, 0.85);

    this.camera = new FlyCamera('camera1', new Vector3(0, 3, -5), this.scene);

    this.camera.setTarget(new Vector3(0, 2, 0));
    this.lightsAction = new LightsActions(this.scene, this.camera, this.engine);
    this.lightsAction.instantiateLights();
    this.lights = this.lightsAction.lights;

    const ground = MeshBuilder.CreateGround('ground', { width: 300, height: 300 });
    this.lights.groundLight = new GridMaterial('groundMat', this.scene);
    this.lights.groundLight.majorUnitFrequency = 20;
    this.lights.groundLight.gridOffset = new Vector3(0, 0, 4);
    this.lights.groundLight.mainColor = new Color3(1, 1, 1);
    this.lights.groundLight.lineColor = new Color3(0, 0, 0);
    ground.material = this.lights.groundLight;
    ground.material.backFaceCulling = false;
    ground.checkCollisions = true;

    this.forestActions = new ForestActions(this.scene);
    await this.forestActions.instantiateForest();
    this.forest = this.forestActions.forest;

    this.animationsActions = new AnimationsActions(this.scene, this.forest);
    await this.animationsActions.initiateAnimation();
    this.koodibril = this.animationsActions.koodibril;

    new DeviceSourceManager(this.scene.getEngine()).onDeviceConnectedObservable.add(device => {
      this.device = device.deviceType;
    });

    // if (this.device === 2) {
    //   this.guiAction = new GuiActions(this.scene, this.camera, this.engine, this.lights, this.forest);
    //   this.guiAction.instantiatePannelGui();
    // }

    this.timeout = false;
    this.open = false;
    this.engine.hideLoadingUI();
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
            break;
          case PointerEventTypes.POINTERDOUBLETAP:
            if (!this.move && !this.animationsActions.loading) {
              if (this.open) {
                this.opener(0, 0);
                this.reset();
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
    if (!this.animationsActions.loading) {
      this.koodibril.lastFly.stop();
      this.koodibril.lastFly.onAnimationEndObservable.clear();
      if (this.open) {
        this.animationsActions.retract_fast_flower();
        this.animationsActions.retract_tree();
        this.animationsActions.retract_bush();
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
    }
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
    const delta = Math.sign(event.deltaY);
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
    const flowerPos = this.forest.flowers.front.meshe.position;
    const xOffsetr = flowerPos.x < 0 ? 0.5 : 0.1;
    const xOffsetl = flowerPos.x < 0 ? 0.1 : 0.5;
    if (flowerPos.x >= x - xOffsetr && flowerPos.x <= x + xOffsetl && flowerPos.y >= y - 0.5 && flowerPos.y <= y + 1 && !this.open) {
      this.koodibril.lastFly.stop();
      this.koodibril.lastFly.onAnimationEndObservable.clear();
      this.open = true;
      this.animationsActions.loading = true;
      this.animationsActions.goToFlower();
      this.animationsActions.deploy_flower();
      this.animationsActions.deploy_bush();
      this.animationsActions.deploy_tree();
    } else if (
      (flowerPos.x <= x - xOffsetr || flowerPos.x >= x + xOffsetl || flowerPos.y <= y - 0.5 || flowerPos.y >= y + 1) &&
      this.open
    ) {
      this.animationsActions.retract_flower();
      this.animationsActions.retract_tree();
      this.animationsActions.retract_bush();
      this.open = false;
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
