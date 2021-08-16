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
  StandardMaterial,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

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

  private branch!: Mesh;
  private koodibril!: AbstractMesh;
  private trees!: AbstractMesh[];
  private bushes!: AbstractMesh[];
  private forest!: AbstractMesh[];
  private leftoright!: boolean;
  private timeout!: boolean;

  public constructor(private ngZone: NgZone, private windowRef: WindowRefService) {}

  public async createScene(canvas: ElementRef<HTMLCanvasElement>): Promise<void> {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;
    this.move = false;

    // Then, load the Babylon 3D engine:
    this.engine = new Engine(this.canvas, true);

    // create a basic BJS Scene object
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0, 0, 0, 0);

    // create a FreeCamera, and set its position to (x:5, y:10, z:-20 )
    this.camera = new FlyCamera('camera1', new Vector3(0, 3, -5), this.scene);

    // target the camera to scene origin
    this.camera.setTarget(new Vector3(0, 2, 0));

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    this.light = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);
    const linecolor = new Color3(0, 0, 0);
    for (let x = -25; x <= 25; x++) {
      const optionsx = {
        points: [new Vector3(x, 0, -25), new Vector3(x, 0, 25)],
        updatable: false,
      };
      const linesx = MeshBuilder.CreateLines('lines', optionsx, this.scene);
      linesx.color = linecolor;
      const optionsz = {
        points: [new Vector3(-25, 0, x), new Vector3(25, 0, x)],
        updatable: false,
      };
      const linesz = MeshBuilder.CreateLines('lines', optionsz, this.scene);
      linesz.color = linecolor;
    }

    this.trees = [];
    this.bushes = [];
    this.forest = [];
    for (let i = 1; i <= 9; i++) {
      const tree = await SceneLoader.ImportMeshAsync('', '../../content/assets/models/', 'tree' + i.toString() + '.glb', this.scene);
      tree.meshes[0].scaling.scaleInPlace(2.5);
      tree.meshes[0].rotate(new Vector3(0, 1, 0), 1.5 * Math.PI);
      tree.meshes[0].position = new Vector3(-10, 0, -10);
      this.trees.push(tree.meshes[0]);
      if (i <= 4) {
        const bush = await SceneLoader.ImportMeshAsync('', '../../content/assets/models/', 'bush' + i.toString() + '.glb', this.scene);
        bush.meshes[0].scaling.scaleInPlace(2.5);
        bush.meshes[0].rotate(new Vector3(0, 1, 0), 1.5 * Math.PI);
        bush.meshes[0].position = new Vector3(-10, 0, -10);
        this.bushes.push(bush.meshes[0]);
      }
    }
    this.seed();

    // create a built-in "branch" shape; its constructor takes 4 params: name, subdivisions, radius, scene
    this.branch = MeshBuilder.CreateDisc('disc', { radius: 0.1 });
    const colibri = await SceneLoader.ImportMeshAsync('', '../../content/assets/models/', 'koodibril.glb', this.scene);
    const koodibrilAnim = this.scene.getAnimationGroupByName('fly');
    if (koodibrilAnim) {
      colibri.animationGroups[0].stop();
      koodibrilAnim.start(true, 10.0, koodibrilAnim.from, koodibrilAnim.to, false);
    }
    this.koodibril = colibri.meshes[0];
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
    this.fly();
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

      this.canvas.addEventListener('mouseout', () => {
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
      });

      this.canvas.addEventListener('mousemove', e => {
        this.nofly = true;
        const offsetCanvasx = this.canvas.width / 200;
        const offsetCanvasy = this.canvas.height / 200;
        const x = (this.scene.pointerX / 100 - offsetCanvasx) / 2;
        const y = (-this.scene.pointerY / 100 + offsetCanvasy + 3) / 1.5;
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
        if (!this.timeout) {
          this.timeout = true;
          setTimeout(() => {
            this.nofly = false;
            this.fly();
            this.timeout = false;
          }, 2000);
        }
      });

      this.canvas.addEventListener('click', () => {
        console.log('click');
        this.koodibril.rotate(new Vector3(0, 1, 0), Math.PI);
      });

      this.canvas.addEventListener('wheel', event => {
        const delta = Math.sign(event.deltaY);
        if (!this.move) {
          this.addRow(delta);
          this.move = true;
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
            const zSlide = new Animation('zSlide', 'position.z', frameRate, Animation.ANIMATIONTYPE_FLOAT);
            zSlide.setKeys(zkeyFrames);
            rollOver = this.scene.beginDirectAnimation(element, [zSlide], 0, 2 * frameRate, false, 2);
          });
          rollOver!.onAnimationEndObservable.add(() => {
            this.move = false;
            this.deleteRow(delta);
          });
        }
      });

      this.windowRef.window.addEventListener('resize', () => {
        this.engine.resize();
      });
    });
  }

  public goToCenter(): void {
    this.koodibril.position.x = 0;
    this.koodibril.position.y = 0;
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

  public seed(): void {
    this.shuffleMesh(this.trees);
    const treeFront1 = this.trees[0].clone('', null);
    const treeFront2 = this.trees[1].clone('', null);
    const treeMiddle1 = this.trees[2].clone('', null);
    const treeMiddle2 = this.trees[3].clone('', null);
    const treeMiddle3 = this.trees[4].clone('', null);
    const treeBack1 = this.trees[5].clone('', null);
    const treeBack2 = this.trees[6].clone('', null);
    const treeBack3 = this.trees[7].clone('', null);
    const treeBack4 = this.trees[8].clone('', null);

    treeFront1!.position.x = -3;
    treeFront1!.position.z = 0;

    treeFront2!.position.x = 4;
    treeFront2!.position.z = 0;

    treeMiddle1!.position.x = -6;
    treeMiddle1!.position.z = 4;

    treeMiddle2!.position.x = 3;
    treeMiddle2!.position.z = 4;

    treeMiddle3!.position.x = 5;
    treeMiddle3!.position.z = 4;

    treeBack1!.position.x = -4;
    treeBack1!.position.z = 8;

    treeBack2!.position.x = -3;
    treeBack2!.position.z = 8;

    treeBack3!.position.x = 2;
    treeBack3!.position.z = 8;

    treeBack4!.position.x = 5;
    treeBack4!.position.z = 8;

    this.forest.push(treeFront1!);
    this.forest.push(treeFront2!);
    this.forest.push(treeMiddle1!);
    this.forest.push(treeMiddle2!);
    this.forest.push(treeMiddle3!);
    this.forest.push(treeBack1!);
    this.forest.push(treeBack2!);
    this.forest.push(treeBack3!);
    this.forest.push(treeBack4!);

    for (let z = 0; z <= 8; z = z + 4) {
      this.shuffleMesh(this.bushes);
      const cloneBush1 = this.bushes[0].clone('', null); // this.bushes[Math.floor(Math.random() * (4 - 1) + 1)];
      const cloneBush2 = this.bushes[1].clone('', null); // this.bushes[Math.floor(Math.random() * (4 - 1) + 1)];
      const cloneBush3 = this.bushes[2].clone('', null); // this.bushes[Math.floor(Math.random() * (4 - 1) + 1)];
      const cloneBush4 = this.bushes[3].clone('', null); // this.bushes[Math.floor(Math.random() * (4 - 1) + 1)];
      cloneBush1!.position.x = -5;
      cloneBush1!.position.z = z;
      cloneBush2!.position.x = 1;
      cloneBush2!.position.z = z;
      cloneBush3!.position.x = -1;
      cloneBush3!.position.z = z;
      cloneBush4!.position.x = 5;
      cloneBush4!.position.z = z;
      this.forest.push(cloneBush1!);
      this.forest.push(cloneBush2!);
      this.forest.push(cloneBush3!);
      this.forest.push(cloneBush4!);
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
    this.shuffleMesh(this.trees);
    const newTrees = Math.floor(Math.random() * (4 - 2) + 2);
    const tree_positon = [-3, 4, -6, 3, 5, 2];
    const position = this.shuffleArray(tree_positon);
    for (let i = 0; i < newTrees; i++) {
      const newTree = this.trees[i].clone('', null);
      newTree!.position.x = tree_positon[i];
      newTree!.position.z = delta === -1 ? 12 : -4;
      this.forest.push(newTree!);
    }
    this.shuffleMesh(this.bushes);
    const cloneBush1 = this.bushes[0].clone('', null);
    const cloneBush2 = this.bushes[1].clone('', null);
    const cloneBush3 = this.bushes[2].clone('', null);
    const cloneBush4 = this.bushes[3].clone('', null);
    cloneBush1!.position.x = -5;
    cloneBush1!.position.z = delta === -1 ? 12 : -4;
    cloneBush2!.position.x = 1;
    cloneBush2!.position.z = delta === -1 ? 12 : -4;
    cloneBush3!.position.x = -1;
    cloneBush3!.position.z = delta === -1 ? 12 : -4;
    cloneBush4!.position.x = 5;
    cloneBush4!.position.z = delta === -1 ? 12 : -4;
    this.forest.push(cloneBush1!);
    this.forest.push(cloneBush2!);
    this.forest.push(cloneBush3!);
    this.forest.push(cloneBush4!);
  }

  public deleteRow(delta: number): void {
    this.forest.forEach(element => {
      if ((element.position.z === 12 && delta === 1) || (element.position.z === -4 && delta === -1)) {
        // const frameRate = 10;
        // console.log(element.material!.alpha);
        // const alphakeyFrames = [
        //   {
        //     frame: 0,
        //     value: element.material!.alpha,
        //   },
        //   {
        //     frame: frameRate,
        //     value: 0,
        //   }
        // ];
        // const alphaDown = new Animation('alphaDown', 'material.alpha', frameRate, Animation.ANIMATIONTYPE_FLOAT);

        // alphaDown.setKeys(alphakeyFrames);
        // const animations = [alphaDown];
        // const goDown = this.scene.beginDirectAnimation(element, animations, 0, frameRate, false, 1);
        // goDown.onAnimationEndObservable.add(() => {
        //   console.log(element.material!.alpha);
        //   element.dispose();
        // });
        element.dispose();
      }
    });
  }
}
