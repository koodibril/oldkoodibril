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

  private branch!: Mesh;
  private koodibril!: AbstractMesh;
  private trees!: AbstractMesh[];

  public constructor(private ngZone: NgZone, private windowRef: WindowRefService) {}

  public async createScene(canvas: ElementRef<HTMLCanvasElement>): Promise<void> {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    // Then, load the Babylon 3D engine:
    this.engine = new Engine(this.canvas, true);

    // create a basic BJS Scene object
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0, 0, 0, 0);

    // create a FreeCamera, and set its position to (x:5, y:10, z:-20 )
    this.camera = new FlyCamera('camera1', new Vector3(0, 3, -10), this.scene);

    // target the camera to scene origin
    this.camera.setTarget(new Vector3(0, 2, 0));

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    this.light = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);
    const linecolor = new Color3(0, 0, 0);
    for (let x = -25; x <= 25; x++) {
      const optionsx = {
        points: [new Vector3(x, 0, -25), new Vector3(x, 0, 25)], //vec3 array,
        updatable: false,
      };
      const linesx = MeshBuilder.CreateLines('lines', optionsx, this.scene);
      linesx.color = linecolor;
      const optionsz = {
        points: [new Vector3(-25, 0, x), new Vector3(25, 0, x)], //vec3 array,
        updatable: false,
      };
      const linesz = MeshBuilder.CreateLines('lines', optionsz, this.scene);
      linesz.color = linecolor;
    }

    this.trees = [];
    for (let i = 1; i <= 9; i++) {
      const tree = await SceneLoader.ImportMeshAsync('', '../../content/assets/models/', 'tree' + i.toString() + '.glb', this.scene);
      tree.meshes[0].scaling.scaleInPlace(3);
      tree.meshes[0].rotate(new Vector3(0, 1, 0), 1.5 * Math.PI);
      tree.meshes[0].position.x = 0;
      tree.meshes[0].position.y = 0;
      tree.meshes[0].position.z = 0;
      this.trees.push(tree.meshes[0]);
    }
    this.forest();
    this.showWorldAxis(2);

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
    this.branch.position.y = 0;
    this.branch.position.z = 0;
    this.koodibril.scaling.scaleInPlace(0.2);
    this.koodibril.position.y = 1;
    this.koodibril.position.z = 0;
    this.koodibril.parent = this.branch;
    this.koodibril.rotate(new Vector3(0, 1, 0), 1.5 * Math.PI);
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

      const offsetx = this.canvas.width / 200;
      const offsety = this.canvas.height / 200;
      this.canvas.addEventListener('mouseout', () => {
        const translateVector = new Vector3(-this.branch.position.x, -this.branch.position.y, 0);
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

      this.canvas.addEventListener('mousemove', () => {
        const x = this.scene.pointerX / 100 - offsetx;
        const y = -this.scene.pointerY / 100 + offsety;
        this.branch.position.x = x;
        this.branch.position.y = y;
      });

      this.canvas.addEventListener('wheel', event => {
        const delta = Math.sign(event.deltaY);
        this.camera.position.z = this.camera.position.z - delta;
        console.log(event);
      });

      this.windowRef.window.addEventListener('resize', () => {
        this.engine.resize();
      });
    });
  }

  public fly(): void {
    const frameRate = 10;
    const xtravel = Math.floor(Math.random() * (2 - -1) + -1) / Math.floor(Math.random() * 3 + 2);
    const ytravel = Math.floor(Math.random() * (2 - -1) + -1) / Math.floor(Math.random() * 3 + 2);
    const rotate =
      this.koodibril.position.x > xtravel
        ? this.koodibril.rotate(new Vector3(0, 1, 0), 1.5 * Math.PI)
        : this.koodibril.rotate(new Vector3(0, 1, 0), -1.5 * Math.PI);
    const xkeyFrames = [
      {
        frame: 0,
        value: this.koodibril.position.x,
      },
      {
        frame: frameRate,
        value: xtravel,
      },
      {
        frame: 2 * frameRate,
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
      {
        frame: 2 * frameRate,
        value: ytravel,
      },
    ];

    const xSlide = new Animation('xSlide', 'position.x', frameRate, Animation.ANIMATIONTYPE_FLOAT);
    const ySlide = new Animation('ySlide', 'position.y', frameRate, Animation.ANIMATIONTYPE_FLOAT);

    xSlide.setKeys(xkeyFrames);
    ySlide.setKeys(ykeyFrames);
    const animations = [xSlide, ySlide];
    const flyAnimate = this.scene.beginDirectAnimation(this.koodibril, animations, 0, 2 * frameRate, false, 4);
    flyAnimate.onAnimationEndObservable.add(() => {
      this.fly();
    });
  }

  public forest(): void {
    const treeFront1 = this.trees[3]; //this.trees[Math.floor(Math.random() * (9 - 1) + 1)];
    const treeFront2 = this.trees[1]; //this.trees[Math.floor(Math.random() * (9 - 1) + 1)];
    const treeMiddle1 = this.trees[4]; //this.trees[Math.floor(Math.random() * (9 - 1) + 1)];
    const treeMiddle2 = this.trees[0]; //this.trees[Math.floor(Math.random() * (9 - 1) + 1)];
    const treeMiddle3 = this.trees[2]; //this.trees[Math.floor(Math.random() * (9 - 1) + 1)];
    const treeBack1 = this.trees[8]; //this.trees[Math.floor(Math.random() * (9 - 1) + 1)];
    const treeBack2 = this.trees[6]; //this.trees[Math.floor(Math.random() * (9 - 1) + 1)];
    const treeBack3 = this.trees[7]; //this.trees[Math.floor(Math.random() * (9 - 1) + 1)];
    const treeBack4 = this.trees[5]; //this.trees[Math.floor(Math.random() * (9 - 1) + 1)];
    treeFront1.position.x = -4;
    treeFront1.position.z = 0;

    treeFront2.position.x = 5;
    treeFront2.position.z = 0;

    treeMiddle1.position.x = -7;
    treeMiddle1.position.z = 4;

    treeMiddle2.position.x = 3;
    treeMiddle2.position.z = 4;

    treeMiddle3.position.x = 6;
    treeMiddle3.position.z = 4;

    treeBack1.position.x = -4;
    treeBack1.position.z = 8;

    treeBack2.position.x = -3;
    treeBack2.position.z = 8;

    treeBack3.position.x = 2;
    treeBack3.position.z = 8;

    treeBack4.position.x = 5;
    treeBack4.position.z = 8;
  }

  public showWorldAxis(size: number): void {
    // var makeTextPlane = function(text, color, size) {
    //     var dynamicTexture = new DynamicTexture("DynamicTexture", 50, scene, true);
    //     dynamicTexture.hasAlpha = true;
    //     dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color , "transparent", true);
    //     var plane = Mesh.CreatePlane("TextPlane", size, scene, true);
    //     plane.material = new StandardMaterial("TextPlaneMaterial", scene);
    //     plane.material.backFaceCulling = false;
    //     plane.material.specularColor = new Color3(0, 0, 0);
    //     plane.material.diffuseTexture = dynamicTexture;
    // return plane;
    //  };
    const axisX = Mesh.CreateLines(
      'axisX',
      [
        Vector3.Zero(),
        new Vector3(size, 0, 0),
        new Vector3(size * 0.95, 0.05 * size, 0),
        new Vector3(size, 0, 0),
        new Vector3(size * 0.95, -0.05 * size, 0),
      ],
      this.scene
    );
    axisX.color = new Color3(1, 0, 0);
    const axisY = Mesh.CreateLines(
      'axisY',
      [
        Vector3.Zero(),
        new Vector3(0, size, 0),
        new Vector3(-0.05 * size, size * 0.95, 0),
        new Vector3(0, size, 0),
        new Vector3(0.05 * size, size * 0.95, 0),
      ],
      this.scene
    );
    axisY.color = new Color3(0, 1, 0);
    const axisZ = Mesh.CreateLines(
      'axisZ',
      [
        Vector3.Zero(),
        new Vector3(0, 0, size),
        new Vector3(0, -0.05 * size, size * 0.95),
        new Vector3(0, 0, size),
        new Vector3(0, 0.05 * size, size * 0.95),
      ],
      this.scene
    );
    axisZ.color = new Color3(0, 0, 1);
  }
}
