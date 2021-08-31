import { WindowRefService } from './../services/window-ref.service';
import { ElementRef, Injectable, NgZone } from '@angular/core';
import {
  Engine,
  Scene,
  Light,
  MeshBuilder,
  SceneLoader,
  Color4,
  Vector3,
  HemisphericLight,
  Animation,
  Animatable,
  Space,
  AbstractMesh,
  Layer,
  Color3,
  FlyCamera,
  AnimationGroup,
  Material,
  PointerEventTypes,
  DeviceSourceManager,
  SceneOptimizer,
  AssetContainer
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { GridMaterial } from '@babylonjs/materials';

interface Flower {
  animations: AnimationGroup[],
  meshe: AbstractMesh,
  position: number
}

interface Bush {
  animations: AnimationGroup[],
  meshe: AbstractMesh,
  position: number
}

interface Tree {
  animations: AnimationGroup[],
  meshe: AbstractMesh,
  position: number
}

interface Trees {
  front: Tree[],
  middle: Tree[],
  back: Tree[],
  delete: Tree[]
}

interface Bushes {
  front: Bush[],
  middle: Bush[],
  back: Bush[],
  delete: Bush[]
}

interface Flowers {
  front: Flower,
  middle: Flower,
  back: Flower,
  delete: Flower
}

interface Forest {
  trees: Trees,
  flowers: Flowers,
  bushes: Bushes,
}

@Injectable({ providedIn: 'root' })
export class EngineService {
  private canvas!: HTMLCanvasElement;
  private engine!: Engine;
  private camera!: FlyCamera;
  private scene!: Scene;
  private sun!: Light;
  private moon!: Light;
  private layer!: Layer;
  private move!: boolean;
  private material!: Material;

  private koodibril!: AbstractMesh;
  private forest!: Forest;
  private leftoright!: boolean;
  private timeout!: boolean;
  private open!: boolean;
  private koodibrilAnim!: AnimationGroup[];
  private koodibrilMat!: AbstractMesh;
  private loading!: boolean;
  private touchY!: number;
  private device!: number;
  private lastFly!: Animatable;
  private flower!: AssetContainer;
  private trees!: AssetContainer[];
  private bushes!: AssetContainer[];

  public constructor(private ngZone: NgZone, private windowRef: WindowRefService) {}

  public async createScene(canvas: ElementRef<HTMLCanvasElement>): Promise<void> {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;
    this.move = false;

    // Then, load the Babylon 3D engine:
    this.engine = new Engine(this.canvas, true);
    this.engine.displayLoadingUI();

    // create a basic BJS Scene object
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0, 0, 0, 0);
    this.scene.fogMode = Scene.FOGMODE_LINEAR;
    this.scene.fogStart = 4.0;
    this.scene.fogEnd = 20.0;
    this.scene.fogColor = new Color3(0.9, 0.9, 0.85);
    this.scene.fogDensity = 0.15;

    // create a FreeCamera, and set its position to (x:5, y:10, z:-20 )
    this.camera = new FlyCamera('camera1', new Vector3(0, 3, -5), this.scene);

    // target the camera to scene origin
    this.camera.setTarget(new Vector3(0, 2, 0));

    // day light
    this.sun = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);
    // night light
    // this.moon = new DirectionalLight("DirectionalLight", new Vector3(0, -1, 0), this.scene);


    const ground = MeshBuilder.CreateGround('ground', { width: 30, height: 30 });
    const grid = new GridMaterial('groundMat', this.scene);
    grid.majorUnitFrequency = 20;
    grid.gridOffset = new Vector3(0, 0, 4);
    grid.mainColor = new Color3(1, 1, 1);
    grid.lineColor = new Color3(0, 0, 0);
    ground.material = grid;
    ground.material.backFaceCulling = false;
    ground.checkCollisions = true;

    this.forest = <Forest>{};
    this.forest.trees = <Trees>{};
    this.forest.bushes = <Bushes>{};
    this.forest.flowers = <Flowers>{};
    
    this.forest.trees.front = [];
    this.forest.trees.middle = [];
    this.forest.trees.back = [];
    this.forest.trees.delete = [];
    this.forest.bushes.front = [];
    this.forest.bushes.middle = [];
    this.forest.bushes.back = [];
    this.forest.bushes.delete = [];
    this.forest.flowers.front = <Flower>{};
    this.forest.flowers.middle = <Flower>{};
    this.forest.flowers.back = <Flower>{};
    this.forest.flowers.delete = <Flower>{};
    await this.importforest();
    this.seed();

    const colibri = await SceneLoader.ImportMeshAsync('', '../../content/assets/models/', 'koodibril.glb', this.scene);
    colibri.animationGroups[0].stop();
    colibri.animationGroups[0].start(true, 10.0);
    this.koodibril = colibri.meshes[0];
    this.koodibrilMat = colibri.meshes[1];
    this.koodibrilAnim = colibri.animationGroups;
    this.koodibril.scaling.scaleInPlace(0.13);
    this.koodibril.position.y = 2;
    this.koodibril.position.z = 0;
    this.koodibril.rotate(new Vector3(0, 1, 0), 1.5 * Math.PI);
    this.leftoright = true;
    this.timeout = false;
    this.open = false;
    this.loading = false;
    this.fly();
    SceneOptimizer.OptimizeAsync(this.scene),
    this.engine.hideLoadingUI();
    new DeviceSourceManager(this.scene.getEngine()).onDeviceConnectedObservable.add((device) => {
      this.device = device.deviceType;
      console.log(this.device);
    });
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
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

      this.scene.onPointerObservable.add(pointerInfo => {
        switch (pointerInfo.type) {
          case PointerEventTypes.POINTERMOVE:
            this.device === 2 ? this.onMove() : null;
            break;
          case PointerEventTypes.POINTERWHEEL:
            this.wheel(pointerInfo.event);
            break;
          case PointerEventTypes.POINTERTAP:
            break;
          case PointerEventTypes.POINTERDOUBLETAP:
            if (this.open) {
              this.opener(0, 0);
              this.reset();
              this.fly();
            } else {
              this.opener(this.forest.flowers.front.meshe.position.x, this.forest.flowers.front.meshe.position.y)
            }
            break;
        }
      });

      this.windowRef.window.addEventListener('deviceorientation', (event) => {
        if (this.device === 3) {
          let x = event.beta as number;  // In degree in the range [-180,180)
          let y = event.gamma as number; // In degree in the range [-90,90)
          
        const offsetCanvasx = this.canvas.width / 200;
        const offsetCanvasy = this.canvas.height / 200;
        
          // Because we don't want to have the device upside down
          // We constrain the x value to the range [-90,90]
          if (x >  90) { x =  90};
          if (x < -90) { x = -90};
        
          // To make computation easier we shift the range of
          // x and y to [0,180]
          x += 90;
          y += 90;
        
          // 10 is half the size of the ball
          // It center the positioning point to the center of the ball
          
          this.koodibril.position.x = (offsetCanvasx * x / 180 - 10);
          this.koodibril.position.y = (offsetCanvasy * y / 180 - 10);
        }
      });

      this.canvas.addEventListener('touchstart', (event) => {
        this.touchY = event.touches[0].clientY;
      });

      this.canvas.addEventListener('touchend', (event) => {
        const test = <any>{};
        const currentY = event.changedTouches[0].clientY;
        if (currentY > this.touchY && ((currentY - this.touchY) > 50)){
          test.deltaY = -1;
          this.wheel(test);
        } else if(currentY < this.touchY && ((currentY - this.touchY) < -50)){
          test.deltaY = 1;
          this.wheel(test);
        }
      });

      this.canvas.addEventListener('mouseout', () => {
        this.reset();
      });

      this.windowRef.window.addEventListener('resize', () => {
        this.engine.resize();
      });
      this.windowRef.window.addEventListener('orientationchange', () => {
        this.engine.resize();
      });
    });
  }

  public reset(): void {
    if (!this.loading) {
      this.loading = false;
      if (this.open) {
        this.retract_fast_flower();
        this.retract_tree();
        this.retract_bush();
        this.open = false;
      }
      this.koodibrilAnim[1].stop();
      this.koodibrilAnim[0].start(true, 10);
      const translateVector = new Vector3(-this.koodibril.position.x, -this.koodibril.position.y + 2, 0);
      const distance = translateVector.length();

      const direction = new Vector3(translateVector.x, translateVector.y, translateVector.z);
      direction.normalize();
      const deltaDistance = 0.2;

      let i = 0;
      this.scene.registerAfterRender(() => {
        if (i++ * deltaDistance <= distance) {
          this.koodibril.translate(direction, deltaDistance, Space.WORLD);
        }
      });
    }
  }

  public onMove(): void {
    if (!this.loading) {
      this.lastFly.stop();
      this.lastFly.onAnimationEndObservable.clear();
      const offsetCanvasx = this.canvas.width / 200;
      const offsetCanvasy = this.canvas.height / 200;
      const x = (this.scene.pointerX / 100 - offsetCanvasx) / 2;
      const y = (-this.scene.pointerY / 100 + offsetCanvasy + 3) / 1.5;
      this.opener(x, y);
      if (!this.open) {
        if (this.koodibril.position.x > x && !this.leftoright) {
          this.koodibril.rotate(new Vector3(0, 1, 0), Math.PI);
          this.leftoright = true;
        }
        if (this.koodibril.position.x < x && this.leftoright) {
          this.koodibril.rotate(new Vector3(0, 1, 0), Math.PI);
          this.leftoright = false;
        }
        this.koodibril.position.x = x;
        this.koodibril.position.y = y;
      }
      if (!this.timeout) {
        this.timeout = true;
        setTimeout(() => {
          if (!this.open) {
            this.fly();
          }
          this.timeout = false;
        }, 2000);
      }
    }
  }

  public wheel(event: any): void {
    const delta = Math.sign(event.deltaY);
    if (this.open) {
      this.reset();
    }
    if (!this.move && !this.loading) {
      this.move = true;
        this.addRow(delta);
        let rollOver: any;
        let toMove: any;
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
              const frameRate = 10;
              const zkeyFrames = [
                {
                  frame: 0,
                  value: element.meshe.position.z,
                },
                {
                  frame: frameRate,
                  value: element.meshe.position.z as number + 4 * delta,
                },
              ];
              const ykeyFramesOut = [
                {
                  frame: 0,
                  value: element.meshe.position.y,
                },
                {
                  frame: frameRate,
                  value: -5,
                },
              ];
              const ykeyFramesIn = [
                {
                  frame: 0,
                  value: element.meshe.position.y,
                },
                {
                  frame: frameRate,
                  value: element.meshe.name === 'flower' ? 1.5 : 0,
                },
              ];
              const zSlide = new Animation('zSlide', 'position.z', frameRate, Animation.ANIMATIONTYPE_FLOAT);
              const ySlideOut = new Animation('zSlide', 'position.y', frameRate, Animation.ANIMATIONTYPE_FLOAT);
              const ySlideIn = new Animation('zSlide', 'position.y', frameRate, Animation.ANIMATIONTYPE_FLOAT);
              zSlide.setKeys(zkeyFrames);
              ySlideOut.setKeys(ykeyFramesOut);
              ySlideIn.setKeys(ykeyFramesIn);
              if (element.meshe.position.z === 8 && delta === 1) {
                rollOver = this.scene.beginDirectAnimation(element.meshe, [zSlide, ySlideOut], 0, frameRate, false, 2);
              } else if (element.meshe.position.z === 12 && delta === -1) {
                rollOver = this.scene.beginDirectAnimation(element.meshe, [zSlide, ySlideIn], 0, frameRate, false, 2);
              } else {
                rollOver = this.scene.beginDirectAnimation(element.meshe, [zSlide], 0, frameRate, false, 2);
              }
            });
        }
        rollOver!.onAnimationEndObservable.add(() => {
          this.move = false;
          this.open = false;
          this.device === 2 ? this.opener(this.koodibril.position.x, this.koodibril.position.y) : null;
          this.deleteRow();
        });
    }
  }

  public goToCenter(): void {
      const frameRate = 10;
      const xkeyFrames = [
        {
          frame: 0,
          value: this.koodibril.position.x,
        },
        {
          frame: frameRate,
          value: 0,
        },
      ];
      const ykeyFrames = [
        {
          frame: 0,
          value: this.koodibril.position.y,
        },
        {
          frame: frameRate,
          value: 0,
        },
      ];

      const xSlide = new Animation('xSlide', 'position.x', frameRate, Animation.ANIMATIONTYPE_FLOAT);
      const ySlide = new Animation('ySlide', 'position.y', frameRate, Animation.ANIMATIONTYPE_FLOAT);

      xSlide.setKeys(xkeyFrames);
      ySlide.setKeys(ykeyFrames);
      const animations = [xSlide, ySlide];
      this.scene.beginDirectAnimation(this.koodibril, animations, 0, frameRate, false, 2);
  }

  public opener(x: number, y: number): void {
    const flowerPos = this.forest.flowers.front.meshe.position;
    const xOffsetr = flowerPos.x < 0 ? 0.5 : 0.1;
    const xOffsetl = flowerPos.x < 0 ? 0.1 : 0.5;
    if (flowerPos.x >= x - xOffsetr && flowerPos.x <= x + xOffsetl && flowerPos.y >= y - 0.5 && flowerPos.y <= y + 1 && !this.open) {
      this.lastFly.stop();
      this.lastFly.onAnimationEndObservable.clear();
      this.open = true;
      this.loading = true;
      this.goToFlower();
      this.deploy_flower();
      this.deploy_bush();
      this.deploy_tree();
    } else if (
      (flowerPos.x <= x - xOffsetr || flowerPos.x >= x + xOffsetl || flowerPos.y <= y - 0.5 || flowerPos.y >= y + 1) &&
      this.open
    ) {
      this.retract_flower();
      this.retract_tree();
      this.retract_bush();
      this.open = false;
      this.koodibrilAnim[1].stop();
      this.koodibrilAnim[0].start(true, 10);
      this.koodibrilMat.material!.wireframe = false;
    }
  }

  public stop_flower(): void {
    this.forest.flowers.front.animations.forEach(element => {
      element.stop();
    });
  }

  public deploy_flower(): void {
    this.stop_flower();
    this.forest.flowers.front.animations[2].start(false, 1).onAnimationEndObservable.add(() => {
      this.forest.flowers.front.animations[4].start(false, 1);
      this.forest.flowers.front.animations[6].start(false, 1);
    });
  }

  public retract_flower(): void {
    this.stop_flower()
    this.forest.flowers.front.animations[5].start(false, 1);
    this.forest.flowers.front.animations[3].start(false, 1).onAnimationEndObservable.add(() => {
      this.forest.flowers.front.animations[0].start(false, 1);
    });
  }

  public retract_fast_flower(): void {
    this.forest.flowers.front.animations[5].start(false, 0.5);
    this.forest.flowers.front.animations[3].start(false, 0.5);
    this.forest.flowers.front.animations[0].start(false, 0.5);
  }

  public stop_tree(): void {
    this.forest.trees.front.forEach(element => {
      element.animations.forEach(element2 => {
        element2.stop();
      });
    })
  }

  public deploy_tree(): void {
    this.stop_tree();
    for (let i = 0; i < this.forest.trees.front.length; i++) {
      this.forest.trees.front[i].animations[0].start(false, 0.3);
      this.forest.trees.front[i].animations[2].start(false, 0.3);
    }
  }

  public retract_tree(): void {
    this.stop_tree();
    for (let i = 0; i < this.forest.trees.front.length; i++) {
      this.forest.trees.front[i].animations[0].stop();
      this.forest.trees.front[i].animations[2].stop();
      this.forest.trees.front[i].animations[1].start(false, 0.5);
      this.forest.trees.front[i].animations[3].start(false, 0.5);
    }
  }

  public stop_bush(): void {
    this.forest.bushes.front.forEach(element => {
      element.animations.forEach(element2 => {
        element2.stop();
      });
    })
  }

  public deploy_bush(): void {
    this.stop_bush();
    this.forest.bushes.front.forEach(element => {
      element.animations[0].start(false, 0.3).onAnimationEndObservable.add(() => {
        this.loading = false;
      });
    });
  }

  public retract_bush(): void {
    this.stop_bush();
    this.forest.bushes.front.forEach(element => {
      element.animations[0].stop();
      element.animations[1].start(false, 0.5);
    });
  }

  public goToFlower(): void {
    this.lastFly.stop();
    this.lastFly.onAnimationEndObservable.clear();
    const frameRate = 10;
    const flowerPos = this.forest.flowers.front.meshe.position;
    if (flowerPos.x < 0 && !this.leftoright) {
      this.koodibril.rotate(new Vector3(0, 1, 0), Math.PI);
      this.leftoright = true;
    }
    if (flowerPos.x > 0 && this.leftoright) {
      this.koodibril.rotate(new Vector3(0, 1, 0), Math.PI);
      this.leftoright = false;
    }
    const xkeyFramesKooli = [
      {
        frame: 0,
        value: this.koodibril.position.x,
      },
      {
        frame: frameRate,
        value: flowerPos.x + (flowerPos.x < 0 ? 0.7 : -0.7),
      },
    ];
    const ykeyFramesKooli = [
      {
        frame: 0,
        value: this.koodibril.position.y,
      },
      {
        frame: frameRate,
        value: 1.7,
      },
    ];
    const xSlideKooli = new Animation('xSlide', 'position.x', frameRate, Animation.ANIMATIONTYPE_FLOAT);
    const ySlideKooli = new Animation('ySlide', 'position.y', frameRate, Animation.ANIMATIONTYPE_FLOAT);
    
    xSlideKooli.setKeys(xkeyFramesKooli);
    ySlideKooli.setKeys(ykeyFramesKooli);
    const animationsKooli = [xSlideKooli, ySlideKooli];
      const gotoflower = this.scene.beginDirectAnimation(this.koodibril, animationsKooli, 0, frameRate, false, 2);
      gotoflower.onAnimationEndObservable.add(() => {
      this.koodibrilAnim[0].stop();
      this.koodibrilAnim[1].start(true, 10);
      this.koodibrilMat.material!.wireframe = true;
      });
  }

  public fly(): void {
      const frameRate = 20;
      const xtravel = Math.floor(Math.random() * (2 - -1) + -1) / Math.floor(Math.random() * 3 + 2);
      const ytravel = (Math.floor(Math.random() * (2 - -1) + -1) / Math.floor(Math.random() * 3 + 2)) + 2;
      if (this.koodibril.position.x > xtravel && !this.leftoright) {
        this.koodibril.rotate(new Vector3(0, 1, 0), Math.PI);
        this.leftoright = true;
      } else if (this.koodibril.position.x < xtravel && this.leftoright) {
        this.koodibril.rotate(new Vector3(0, 1, 0), Math.PI);
        this.leftoright = false;
      }
      const xkeyFrames = [
        {
          frame: 0,
          value: this.koodibril.position.x,
        },
        {
          frame: 10,
          value: xtravel,
        },
        {
          frame: 20,
          value: xtravel,
        },
      ];
      const ykeyFrames = [
        {
          frame: 0,
          value: this.koodibril.position.y,
        },
        {
          frame: 10,
          value: ytravel,
        },
        {
          frame: 20,
          value: ytravel,
        },
      ];

      const xSlide = new Animation('xFly', 'position.x', frameRate, Animation.ANIMATIONTYPE_FLOAT);
      const ySlide = new Animation('yFly', 'position.y', frameRate, Animation.ANIMATIONTYPE_FLOAT);

      xSlide.setKeys(xkeyFrames);
      ySlide.setKeys(ykeyFrames);
      const animations = [xSlide, ySlide];
      this.lastFly = this.scene.beginDirectAnimation(this.koodibril, animations, 0, frameRate, false, 1);
      
      this.lastFly.onAnimationEndObservable.addOnce(() => {
        this.fly();
    });
  }

  public seed(): void {
    const random_tree = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    this.addtree(new Vector3(-3, 0, 0), 0, random_tree[0]);
    this.addtree(new Vector3(4, 0, 0), 0, random_tree[1]);
    this.addtree(new Vector3(-6, 0, 4), 1, random_tree[2]);
    this.addtree(new Vector3(3, 0, 4), 1, random_tree[3]);
    this.addtree(new Vector3(5, 0, 4), 1, random_tree[4]);
    this.addtree(new Vector3(-4, 0, 8), 2, random_tree[5]);
    this.addtree(new Vector3(-3, 0, 8), 2, random_tree[6]);
    this.addtree(new Vector3(2, 0, 8), 2, random_tree[7]);
    this.addtree(new Vector3(5, 0, 8), 2, random_tree[8]);

    for (let z = 0; z <= 8; z = z + 4) {
      const random = this.shuffleArray([1, 2, 3, 4]);
      this.addbush(new Vector3(-5, 0, z), z / 4, random[0]);
      this.addbush(new Vector3(1, 0, z), z / 4, random[1]);
      this.addbush(new Vector3(-1, 0, z), z / 4, random[2]);
      this.addbush(new Vector3(5, 0, z), z / 4, random[3]);
      this.addflower(new Vector3(Math.random() * (2 - -2) + -2, 1.5, z), z / 4);
    }
  }

  public shuffleMesh(array: Array<AbstractMesh>): Array<AbstractMesh> {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  public shuffleArray(array: Array<number>): Array<number> {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  public addRow(delta: number): void {
    if (delta === 1) {
      this.forest.bushes.delete = this.forest.bushes.back;
      this.forest.bushes.back = this.forest.bushes.middle;
      this.forest.bushes.middle = this.forest.bushes.front;
      this.forest.bushes.front = [];

      this.forest.flowers.delete = this.forest.flowers.back;
      this.forest.flowers.back = this.forest.flowers.middle;
      this.forest.flowers.middle = this.forest.flowers.front;
      this.forest.flowers.front = <Flower>{};

      this.forest.trees.delete = this.forest.trees.back;
      this.forest.trees.back = this.forest.trees.middle;
      this.forest.trees.middle = this.forest.trees.front;
      this.forest.trees.front = [];
    } else {
      this.forest.bushes.delete = this.forest.bushes.front;
      this.forest.bushes.front = this.forest.bushes.middle;
      this.forest.bushes.middle = this.forest.bushes.back;
      this.forest.bushes.back = [];

      this.forest.flowers.delete = this.forest.flowers.front;
      this.forest.flowers.front = this.forest.flowers.middle;
      this.forest.flowers.middle = this.forest.flowers.back;
      this.forest.flowers.back = <Flower>{};

      this.forest.trees.delete = this.forest.trees.front;
      this.forest.trees.front = this.forest.trees.middle;
      this.forest.trees.middle = this.forest.trees.back;
      this.forest.trees.back = [];
    }
    const random_tree = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const newTrees = Math.floor(Math.random() * (4 - 2) + 2);
    const position = this.shuffleArray([-3, -6, 3, 5]);
    for (let i = 0; i < newTrees; i++) {
      this.addtree(
        new Vector3(position[i], delta === -1 ? -6 : 0, delta === -1 ? 12 : -4),
        delta === -1 ? 2 : 0,
        random_tree[i]
      );
    }
    const random = this.shuffleArray([1, 2, 3, 4]);
    this.addflower(
      new Vector3(Math.random() * (2 - -2) + -2, delta === -1 ? -5 : 1.5, delta === -1 ? 12 : -4),
      delta === -1 ? 2 : 0
    );
    this.addbush(new Vector3(-5, delta === -1 ? -5 : 0, delta === -1 ? 12 : -4), delta === -1 ? 2 : 0, random[0]);
    this.addbush(new Vector3(1, delta === -1 ? -5 : 0, delta === -1 ? 12 : -4), delta === -1 ? 2 : 0, random[1]);
    this.addbush(new Vector3(-1, delta === -1 ? -5 : 0, delta === -1 ? 12 : -4), delta === -1 ? 2 : 0, random[2]);
    this.addbush(new Vector3(5, delta === -1 ? -5 : 0, delta === -1 ? 12 : -4), delta === -1 ? 2 : 0, random[3]);
  }

  public deleteRow(): void {
    for (let i = 0; i < 3; i++) {
      if (i === 0) {
        for (let j = 0; j < this.forest.trees.delete.length; j++) {
          this.forest.trees.delete[j].meshe.dispose();
          this.forest.trees.delete.shift();
          j = -1;
        }
      }
      if (i === 1) {
        for (let j = 0; j < this.forest.bushes.delete.length; j++) {
          this.forest.bushes.delete[j].meshe.dispose();
          this.forest.bushes.delete.shift();
          j = -1;
        }
      }
      if (i === 2) {
        this.forest.flowers.delete.meshe.dispose();
        this.forest.flowers.delete = <Flower>{};
      }
    }
  }

  public addflower(position: Vector3, row: number): void {
    // const flowerImmport = await SceneLoader.ImportMeshAsync('', '../../content/assets/models/', 'flower.glb', this.scene);
    const flowerImport = this.flower.instantiateModelsToScene();
    const flower = <Flower>{};
    flower.animations = flowerImport.animationGroups,
    flower.meshe = flowerImport.rootNodes[0] as AbstractMesh;
    flower.animations[0].stop();
    flower.animations[0].start(false, 10.0);
    flower.animations[5].start(false, 10.0);
    flower.animations[3].start(false, 10.0);
    flower.meshe.scaling.scaleInPlace(0.2);
    flower.meshe.rotate(new Vector3(0, 1, 0), position.x < 0 ? Math.PI * 1.5 : Math.PI / 2);
    flower.meshe.position = position;
    flower.meshe.name = 'flower';
    flower.meshe.checkCollisions = true;
    switch (row) {
      case 0:
        this.forest.flowers.front = flower;
        break;
      case 1:
        this.forest.flowers.middle = flower;
        break;
      case 2:
        this.forest.flowers.back = flower;
        break;
      }
  }

  public addbush(position: Vector3, row: number, mesh: number): void {
    // const bushImport = await SceneLoader.ImportMeshAsync('', '../../content/assets/models/forestv2/bush/', 'bush' + mesh.toString() + 'v2.glb', this.scene);
    const bushImport = this.bushes[mesh].instantiateModelsToScene();
    const bush = <Bush>{};
    bush.animations = bushImport.animationGroups,
    bush.meshe = bushImport.rootNodes[0] as AbstractMesh;
    bush.animations[0].goToFrame(0);
    bush.animations[0].stop();
    bush.animations[1].start(false, 10.0);
    bush.meshe.scaling.scaleInPlace(2.5);
    bush.meshe.rotate(new Vector3(0, 1, 0), Math.PI * 1.5);
    bush.meshe.position = position;
    bush.meshe.name = 'bush';
    bush.meshe.checkCollisions = true;
    switch (row) {
      case 0:
        this.forest.bushes.front.push(bush);
        break;
      case 1:
        this.forest.bushes.middle.push(bush);
        break;
      case 2:
        this.forest.bushes.back.push(bush);
        break;
    }
  }

  public addtree(position: Vector3, row: number, mesh: number): void {
    // const treeImport = await SceneLoader.ImportMeshAsync('', '../../content/assets/models/forestv2/tree/', 'tree' + mesh.toString() + 'v2.glb', this.scene);
    const treeImport = this.trees[mesh].instantiateModelsToScene();
    const tree = <Tree>{};
    tree.animations = treeImport.animationGroups,
    tree.meshe = treeImport.rootNodes[0] as AbstractMesh;
    tree.animations[0].goToFrame(0);
    tree.animations[0].stop();
    tree.animations.sort();
    tree.animations[1].start(false, 10.0);
    tree.animations[3].start(false, 10.0);
    tree.meshe.scaling.scaleInPlace(2.5);
    tree.meshe.checkCollisions = true;
    tree.meshe.rotate(new Vector3(0, 1, 0), Math.PI * 1.5);
    tree.meshe.position = position;
    tree.meshe.name = 'tree';
    switch (row) {
      case 0:
        this.forest.trees.front.push(tree);
        break;
      case 1:
        this.forest.trees.middle.push(tree);
        break;
      case 2:
        this.forest.trees.back.push(tree);
        break;
    }
  }

  public async importforest(): Promise<void> {
    this.flower = await SceneLoader.LoadAssetContainerAsync('../../content/assets/models/', 'flower.glb', this.scene);
    this.trees = [];
    this.bushes = [];
    for (let i = 1; i < 10; i++) {
      this.trees[i] = await SceneLoader.LoadAssetContainerAsync('../../content/assets/models/forestv2/tree/', 'tree' + i.toString() + 'v2.glb', this.scene);
      if (i < 5) {
        this.bushes[i] = await SceneLoader.LoadAssetContainerAsync('../../content/assets/models/forestv2/bush/', 'bush' + i.toString() + 'v2.glb', this.scene);
      }
    }
  }
}
