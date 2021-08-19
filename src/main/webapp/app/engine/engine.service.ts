import { WindowRefService } from './../services/window-ref.service';
import { ElementRef, Injectable, NgZone } from '@angular/core';
import {
  Engine,
  Scene,
  Light,
  MeshBuilder,
  Mesh,
  SceneLoader,
  Color4,
  Vector3,
  HemisphericLight,
  Animation,
  Space,
  AbstractMesh,
  Layer,
  Color3,
  FlyCamera,
  ISceneLoaderAsyncResult,
  AnimationGroup,
  Material,
  PointerEventTypes,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { GridMaterial } from '@babylonjs/materials';

@Injectable({ providedIn: 'root' })
export class EngineService {
  private canvas!: HTMLCanvasElement;
  private engine!: Engine;
  private camera!: FlyCamera;
  private scene!: Scene;
  private light!: Light;
  private layer!: Layer;
  private move!: boolean;
  private nofly!: boolean;
  private material!: Material;

  private branch!: Mesh;
  private koodibril!: AbstractMesh;
  private forest!: AbstractMesh[];
  private leftoright!: boolean;
  private timeout!: boolean;
  private flowers!: any[];
  private bushes!: any[];
  private trees!: any[];
  private open!: boolean;
  private koodibrilAnim!: AnimationGroup[];
  private loading!: boolean;

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

    // create a FreeCamera, and set its position to (x:5, y:10, z:-20 )
    this.camera = new FlyCamera('camera1', new Vector3(0, 3, -5), this.scene);

    // target the camera to scene origin
    this.camera.setTarget(new Vector3(0, 2, 0));

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    this.light = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);

    const ground = MeshBuilder.CreateGround('ground', { width: 30, height: 30 });
    const grid = new GridMaterial('groundMat', this.scene);
    grid.majorUnitFrequency = 20;
    grid.gridOffset = new Vector3(0, 0, 4);
    grid.mainColor = new Color3(1, 1, 1);
    grid.lineColor = new Color3(0, 0, 0);
    ground.material = grid;
    ground.material.backFaceCulling = false;

    this.trees = [];
    this.forest = [];
    this.flowers = [];
    this.bushes = [];
    await this.seed();

    // create a built-in "branch" shape; its constructor takes 4 params: name, subdivisions, radius, scene
    this.branch = MeshBuilder.CreateDisc('disc', { radius: 0.001 });
    const colibri = await SceneLoader.ImportMeshAsync('', '../../content/assets/models/', 'koodibril.glb', this.scene);

    colibri.animationGroups[0].stop();
    colibri.animationGroups[0].start(true, 10.0);
    this.koodibril = colibri.meshes[0];
    this.koodibrilAnim = colibri.animationGroups;
    // create the material with its texture for the branch and assign it to the branch
    this.branch.position.y = 2;
    this.branch.position.z = 0;
    this.koodibril.scaling.scaleInPlace(0.13);
    this.koodibril.position.y = 1;
    this.koodibril.position.z = 0;
    this.koodibril.parent = this.branch;
    this.koodibril.rotate(new Vector3(0, 1, 0), 1.5 * Math.PI);
    this.nofly = false;
    this.leftoright = true;
    this.timeout = false;
    this.open = false;
    this.loading = false;
    this.fly();
    this.engine.hideLoadingUI();
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
        console.log(pointerInfo.type);
        switch (pointerInfo.type) {
          case PointerEventTypes.POINTERDOWN:
            console.log('POINTER DOWN');
            break;
          case PointerEventTypes.POINTERUP:
            console.log('POINTER UP');
            break;
          case PointerEventTypes.POINTERMOVE:
            this.onMove();
            break;
          case PointerEventTypes.POINTERWHEEL:
            this.wheel(pointerInfo.event);
            break;
          case PointerEventTypes.POINTERPICK:
            console.log('POINTER PICK');
            break;
          case PointerEventTypes.POINTERTAP:
            this.opener(this.flowers[0][1][0].position.x, this.flowers[0][1][0].position.y);
            break;
          case PointerEventTypes.POINTERDOUBLETAP:
            this.opener(0, 0);
            break;
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
      const translateVector = new Vector3(-this.branch.position.x, -this.branch.position.y + 2, 0);
      const distance = translateVector.length();

      const direction = new Vector3(translateVector.x, translateVector.y, translateVector.z);
      direction.normalize();
      const deltaDistance = 0.2;

      let i = 0;
      this.scene.registerAfterRender(() => {
        if (i++ * deltaDistance <= distance) {
          this.branch.translate(direction, deltaDistance, Space.WORLD);
        }
      });
    }
  }

  public onMove(): void {
    if (!this.loading) {
      this.nofly = true;
      const offsetCanvasx = this.canvas.width / 200;
      const offsetCanvasy = this.canvas.height / 200;
      const x = (this.scene.pointerX / 100 - offsetCanvasx) / 2;
      const y = (-this.scene.pointerY / 100 + offsetCanvasy + 3) / 1.5;
      this.opener(x, y);
      if (!this.open) {
        if (this.branch.position.x > x && !this.leftoright) {
          this.koodibril.rotate(new Vector3(0, 1, 0), Math.PI);
          this.leftoright = true;
        }
        if (this.branch.position.x < x && this.leftoright) {
          this.koodibril.rotate(new Vector3(0, 1, 0), Math.PI);
          this.leftoright = false;
        }
        this.branch.position.x = x;
        this.branch.position.y = y;
      }
      if (!this.timeout) {
        this.timeout = true;
        setTimeout(() => {
          if (!this.open) {
            this.nofly = false;
            this.fly();
          }
          this.timeout = false;
        }, 2000);
      }
    }
  }

  public wheel(event: any): void {
    if (this.open) {
      this.loading = true;
      this.fly();
      this.bushes[0][0][0].stop();
      this.bushes[1][0][0].stop();
      this.bushes[2][0][0].stop();
      this.bushes[3][0][0].stop();
      this.bushes[0][0][1].start(false, 0.5);
      this.bushes[1][0][1].start(false, 0.5);
      this.bushes[2][0][1].start(false, 0.5);
      this.bushes[3][0][1].start(false, 0.5);
      this.koodibrilAnim[1].stop();
      this.koodibrilAnim[0].start(true, 10);
      this.flowers[0][0][5].start(false, 0.5);
      this.flowers[0][0][3].start(false, 0.5);
      this.flowers[0][0][0].start(false, 0.5);
    }
    if (!this.move) {
      this.move = true;
      (async () => {
        const delta = Math.sign(event.deltaY);
        await this.addRow(delta);
        let rollOver: any;
        this.forest.forEach(element => {
          const frameRate = 10;
          const zkeyFrames = [
            {
              frame: 0,
              value: element.position.z,
            },
            {
              frame: frameRate,
              value: element.position.z + 4 * delta,
            },
          ];
          const ykeyFramesOut = [
            {
              frame: 0,
              value: element.position.y,
            },
            {
              frame: frameRate,
              value: -5,
            },
          ];
          const ykeyFramesIn = [
            {
              frame: 0,
              value: element.position.y,
            },
            {
              frame: frameRate,
              value: element.name === 'flower' ? 1.5 : 0,
            },
          ];
          const zSlide = new Animation('zSlide', 'position.z', frameRate, Animation.ANIMATIONTYPE_FLOAT);
          const ySlideOut = new Animation('zSlide', 'position.y', frameRate, Animation.ANIMATIONTYPE_FLOAT);
          const ySlideIn = new Animation('zSlide', 'position.y', frameRate, Animation.ANIMATIONTYPE_FLOAT);
          zSlide.setKeys(zkeyFrames);
          ySlideOut.setKeys(ykeyFramesOut);
          ySlideIn.setKeys(ykeyFramesIn);
          if (element.position.z === 8 && delta === 1) {
            rollOver = this.scene.beginDirectAnimation(element, [zSlide, ySlideOut], 0, frameRate, false, 2);
          } else if (element.position.z === 12 && delta === -1) {
            rollOver = this.scene.beginDirectAnimation(element, [zSlide, ySlideIn], 0, frameRate, false, 2);
          } else {
            rollOver = this.scene.beginDirectAnimation(element, [zSlide], 0, frameRate, false, 2);
          }
        });
        rollOver!.onAnimationEndObservable.add(() => {
          this.move = false;
          this.open = false;
          this.deleteRow(delta);
          this.opener(this.branch.position.x, this.branch.position.y);
        });
      })();
    }
  }

  public goToCenter(): void {
    if (this.nofly) {
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
  }

  public opener(x: number, y: number): void {
    const flowerPos = this.flowers[0][1][0].position;
    const xOffsetr = flowerPos.x < 0 ? 0.5 : 0.1;
    const xOffsetl = flowerPos.x < 0 ? 0.1 : 0.5;
    if (flowerPos.x >= x - xOffsetr && flowerPos.x <= x + xOffsetl && flowerPos.y >= y - 0.5 && flowerPos.y <= y + 1 && !this.open) {
      this.nofly = true;
      this.open = true;
      this.loading = true;
      this.goToFlower();
      this.flowers[0][0][1].start(false, 0.5).onAnimationEndObservable.add(() => {
        this.flowers[0][0][4].start(false, 0.5);
        this.flowers[0][0][6].start(false, 0.5);
      });
      this.bushes[0][0][0].start(false, 0.05);
      this.bushes[1][0][0].start(false, 0.05);
      this.bushes[2][0][0].start(false, 0.05);
      this.bushes[3][0][0].start(false, 0.05).onAnimationEndObservable.add(() => {
        this.loading = false;
      });
    } else if (
      (flowerPos.x <= x - xOffsetr || flowerPos.x >= x + xOffsetl || flowerPos.y <= y - 0.5 || flowerPos.y >= y + 1) &&
      this.open
    ) {
      this.flowers[0][0][5].start(false, 0.5);
      this.flowers[0][0][3].start(false, 0.5).onAnimationEndObservable.add(() => {
        this.flowers[0][0][0].start(false, 0.5);
      });
      this.bushes[0][0][0].stop();
      this.bushes[1][0][0].stop();
      this.bushes[2][0][0].stop();
      this.bushes[3][0][0].stop();
      this.bushes[0][0][1].start(false, 0.5);
      this.bushes[1][0][1].start(false, 0.5);
      this.bushes[2][0][1].start(false, 0.5);
      this.bushes[3][0][1].start(false, 0.5);
      this.open = false;
      this.koodibrilAnim[1].stop();
      this.koodibrilAnim[0].start(true, 10);
      this.nofly = false;
      this.fly();
    }
  }

  public goToFlower(): void {
    const frameRate = 10;
    const flowerPos = this.flowers[0][1][0].position;
    const xkeyFramesKooli = [
      {
        frame: 0,
        value: this.koodibril.position.x,
      },
      {
        frame: frameRate,
        value: flowerPos.x < 0 ? 0.7 : -0.7,
      },
    ];
    const ykeyFramesKooli = [
      {
        frame: 0,
        value: this.koodibril.position.y,
      },
      {
        frame: frameRate,
        value: 0.7,
      },
    ];
    const xkeyFramesBranch = [
      {
        frame: 0,
        value: this.branch.position.x,
      },
      {
        frame: frameRate,
        value: flowerPos.x,
      },
    ];
    const ykeyFramesBranch = [
      {
        frame: 0,
        value: this.branch.position.y,
      },
      {
        frame: flowerPos.y,
        value: 1,
      },
    ];
    const xSlideKooli = new Animation('xSlide', 'position.x', frameRate, Animation.ANIMATIONTYPE_FLOAT);
    const ySlideKooli = new Animation('ySlide', 'position.y', frameRate, Animation.ANIMATIONTYPE_FLOAT);
    const xSlideBranch = new Animation('xSlide', 'position.x', frameRate, Animation.ANIMATIONTYPE_FLOAT);
    const ySlideBranch = new Animation('ySlide', 'position.y', frameRate, Animation.ANIMATIONTYPE_FLOAT);

    xSlideKooli.setKeys(xkeyFramesKooli);
    ySlideKooli.setKeys(ykeyFramesKooli);
    xSlideBranch.setKeys(xkeyFramesBranch);
    ySlideBranch.setKeys(ykeyFramesBranch);
    const animationsKooli = [xSlideKooli, ySlideKooli];
    const animationsBranch = [xSlideBranch, ySlideBranch];
    this.scene.beginDirectAnimation(this.branch, animationsBranch, 0, frameRate, false, 2);
    const gotoflower = this.scene.beginDirectAnimation(this.koodibril, animationsKooli, 0, frameRate, false, 2);
    this.koodibrilAnim[0].stop();
    this.koodibrilAnim[1].start(true, 10);
    gotoflower.onAnimationEndObservable.add(() => {
      if (flowerPos.x < 0 && !this.leftoright) {
        this.koodibril.rotate(new Vector3(0, 1, 0), Math.PI);
        this.leftoright = true;
      }
      if (flowerPos.x > 0 && this.leftoright) {
        this.koodibril.rotate(new Vector3(0, 1, 0), Math.PI);
        this.leftoright = false;
      }
    });
  }

  public fly(): void {
    if (!this.nofly) {
      const frameRate = 10;
      const xtravel = Math.floor(Math.random() * (2 - -1) + -1) / Math.floor(Math.random() * 3 + 2);
      const ytravel = Math.floor(Math.random() * (2 - -1) + -1) / Math.floor(Math.random() * 3 + 2);
      if (this.branch.position.x > xtravel && !this.leftoright) {
        this.koodibril.rotate(new Vector3(0, 1, 0), Math.PI);
        this.leftoright = true;
      } else if (this.branch.position.x < xtravel && this.leftoright) {
        this.koodibril.rotate(new Vector3(0, 1, 0), Math.PI);
        this.leftoright = false;
      }
      const xkeyFrames = [
        {
          frame: 0,
          value: this.koodibril.position.x,
        },
        {
          frame: frameRate,
          value: xtravel,
        },
      ];
      const ykeyFrames = [
        {
          frame: 0,
          value: this.koodibril.position.y,
        },
        {
          frame: frameRate,
          value: ytravel,
        },
      ];

      const xSlide = new Animation('xSlide', 'position.x', frameRate, Animation.ANIMATIONTYPE_FLOAT);
      const ySlide = new Animation('ySlide', 'position.y', frameRate, Animation.ANIMATIONTYPE_FLOAT);

      xSlide.setKeys(xkeyFrames);
      ySlide.setKeys(ykeyFrames);
      const animations = [xSlide, ySlide];
      const flyAnimate = this.scene.beginDirectAnimation(this.koodibril, animations, 0, frameRate, false, 2);
      flyAnimate.onAnimationEndObservable.add(() => {
        this.fly();
      });
    }
  }

  public async seed(): Promise<void> {
    const random_tree = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    await this.addtree(new Vector3(-3, 0, 0), false, random_tree[0]);
    await this.addtree(new Vector3(4, 0, 0), false, random_tree[1]);
    await this.addtree(new Vector3(-6, 0, 4), false, random_tree[2]);
    await this.addtree(new Vector3(3, 0, 4), false, random_tree[3]);
    await this.addtree(new Vector3(5, 0, 4), false, random_tree[4]);
    await this.addtree(new Vector3(-4, 0, 8), false, random_tree[5]);
    await this.addtree(new Vector3(-3, 0, 8), false, random_tree[6]);
    await this.addtree(new Vector3(2, 0, 8), false, random_tree[7]);
    await this.addtree(new Vector3(5, 0, 8), false, random_tree[8]);

    for (let z = 0; z <= 8; z = z + 4) {
      const random = this.shuffleArray([1, 2, 3, 4]);
      await this.addbush(new Vector3(-5, 0, z), false, random[0]);
      await this.addbush(new Vector3(1, 0, z), false, random[1]);
      await this.addbush(new Vector3(-1, 0, z), false, random[2]);
      await this.addbush(new Vector3(5, 0, z), false, random[3]);
      await this.addflower(new Vector3(Math.random() * (1.5 - -1) + -1, 1.5, z), false);
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

  public async addRow(delta: number): Promise<void> {
    const random_tree = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const newTrees = Math.floor(Math.random() * (4 - 2) + 2);
    const position = this.shuffleArray([-3, 4, -6, 3, 5, 2]);
    for (let i = 0; i < newTrees; i++) {
      await this.addtree(
        new Vector3(position[i], delta === -1 ? -5 : 0, delta === -1 ? 12 : -4),
        delta === -1 ? false : true,
        random_tree[0]
      );
    }
    const random = this.shuffleArray([1, 2, 3, 4]);
    await this.addflower(
      new Vector3(Math.random() * (1.5 - -1) + -1, delta === -1 ? -5 : 1.5, delta === -1 ? 12 : -4),
      delta === -1 ? false : true
    );
    await this.addbush(new Vector3(-5, delta === -1 ? -5 : 0, delta === -1 ? 12 : -4), delta === -1 ? false : true, random[0]);
    await this.addbush(new Vector3(1, delta === -1 ? -5 : 0, delta === -1 ? 12 : -4), delta === -1 ? false : true, random[1]);
    await this.addbush(new Vector3(-1, delta === -1 ? -5 : 0, delta === -1 ? 12 : -4), delta === -1 ? false : true, random[2]);
    await this.addbush(new Vector3(5, delta === -1 ? -5 : 0, delta === -1 ? 12 : -4), delta === -1 ? false : true, random[3]);
  }

  public deleteRow(delta: number): void {
    for (let i = 0; i < this.forest.length; i++) {
      if ((this.forest[i].position.z >= 11 && delta === 1) || (this.forest[i].position.z <= -3 && delta === -1)) {
        if (this.forest[i].name === 'flower') {
          delta === -1 ? this.flowers.splice(0, 1) : this.flowers.splice(3, 1);
        }
        if (this.forest[i].name === 'bush') {
          delta === -1 ? this.bushes.splice(0, 1) : this.bushes.splice(9, 1);
        }
        if (this.forest[i].name === 'tree') {
          delta === -1 ? this.trees.splice(0, 1) : this.trees.splice(this.trees.length, 1);
        }
        this.forest[i].dispose();
        this.forest.splice(i, 1);
        i = 0;
      }
    }
  }

  public async addflower(position: Vector3, back: boolean): Promise<ISceneLoaderAsyncResult> {
    const flower = await SceneLoader.ImportMeshAsync('', '../../content/assets/models/', 'flower.glb', this.scene);
    flower.animationGroups[0].stop();
    flower.animationGroups[0].start(false, 10.0);
    flower.animationGroups[5].start(false, 10.0);
    flower.animationGroups[3].start(false, 10.0);
    flower.meshes[0].scaling.scaleInPlace(0.2);
    flower.meshes[0].rotate(new Vector3(0, 1, 0), position.x < 0 ? Math.PI * 1.5 : Math.PI / 2);
    flower.meshes[0].position = position;
    flower.meshes[0].name = 'flower';
    back ? this.flowers.unshift([flower.animationGroups, flower.meshes]) : this.flowers.push([flower.animationGroups, flower.meshes]);
    this.forest.push(flower.meshes[0]);
    return flower;
  }

  public async addbush(position: Vector3, back: boolean, mesh: number): Promise<ISceneLoaderAsyncResult> {
    const bush = await SceneLoader.ImportMeshAsync('', '../../content/assets/models/', 'bush' + mesh.toString() + '.glb', this.scene);
    bush.animationGroups[0].goToFrame(0);
    bush.animationGroups[0].stop();
    bush.meshes[0].scaling.scaleInPlace(2.5);
    bush.meshes[0].rotate(new Vector3(0, 1, 0), position.x < 0 ? Math.PI * 1.5 : Math.PI / 2);
    bush.meshes[0].position = position;
    bush.meshes[0].name = 'bush';
    back ? this.bushes.unshift([bush.animationGroups, bush.meshes]) : this.bushes.push([bush.animationGroups, bush.meshes]);
    this.forest.push(bush.meshes[0]);
    return bush;
  }

  public async addtree(position: Vector3, back: boolean, mesh: number): Promise<ISceneLoaderAsyncResult> {
    const tree = await SceneLoader.ImportMeshAsync('', '../../content/assets/models/', 'tree' + mesh.toString() + '.glb', this.scene);
    // tree.animationGroups[0].goToFrame(0);
    // tree.animationGroups[0].stop();
    tree.meshes[0].scaling.scaleInPlace(2.5);
    tree.meshes[0].rotate(new Vector3(0, 1, 0), position.x < 0 ? Math.PI * 1.5 : Math.PI / 2);
    tree.meshes[0].position = position;
    tree.meshes[0].name = 'tree';
    back ? this.trees.unshift([tree.animationGroups, tree.meshes]) : this.trees.push([tree.animationGroups, tree.meshes]);
    this.forest.push(tree.meshes[0]);
    return tree;
  }
}
