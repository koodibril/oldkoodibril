import { WindowRefService } from './../services/window-ref.service';
import { ElementRef, Injectable, NgZone } from '@angular/core';
import {
  Engine,
  FreeCamera,
  Scene,
  Light,
  MeshBuilder,
  Mesh,
  SceneLoader,
  Color3,
  Color4,
  Vector3,
  HemisphericLight,
  StandardMaterial,
  Texture,
  DynamicTexture,
  Animation,
  Space,
  AbstractMesh,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

@Injectable({ providedIn: 'root' })
export class EngineService {
  private canvas!: HTMLCanvasElement;
  private engine!: Engine;
  private camera!: FreeCamera;
  private scene!: Scene;
  private light!: Light;

  private branch!: Mesh;
  private koodibril!: AbstractMesh;

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
    this.camera = new FreeCamera('camera1', new Vector3(0, 0, -10), this.scene);

    // target the camera to scene origin
    this.camera.setTarget(Vector3.Zero());

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    this.light = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);

    // create a built-in "branch" shape; its constructor takes 4 params: name, subdivisions, radius, scene
    //this.koodibril = MeshBuilder.CreateDisc('disc', { tessellation: 12, arc: 5 / 6, radius: 0.2 });
    //this.koodibril = MeshBuilder.CreateCylinder('disc', { tessellation: 12, height: 2, diameter: 0.2 });
    this.branch = MeshBuilder.CreateDisc('disc', { tessellation: 3, radius: 0.1 });
    const imported = await SceneLoader.ImportMeshAsync('', '../../content/assets/models/', 'untitled.glb', this.scene);
    const koodibrilAnim = this.scene.getAnimationGroupByName('metarig|metarig|metarigAction|metarig|metarigAction');
    if (koodibrilAnim) {
      imported.animationGroups[0].stop();
      koodibrilAnim.start(true, 10.0, koodibrilAnim.from, koodibrilAnim.to, false);
    }
    this.koodibril = imported.meshes[0];
    console.log(this.koodibril);
    // create the material with its texture for the branch and assign it to the branch
    const branchMaterial = new StandardMaterial('sun_surface', this.scene);
    branchMaterial.diffuseTexture = new Texture('../../content/assets/textures/sun.jpg', this.scene);
    this.branch.material = branchMaterial;
    //this.koodibril.material = branchMaterial;
    //this.koodibril.parent = this.branch;
    // move the branch upward 1/2 of its height
    this.branch.position.y = 0;
    this.branch.position.z = 0;
    this.koodibril.scaling.scaleInPlace(0.1);
    this.koodibril.position.y = 1;
    this.koodibril.position.z = 0;
    this.koodibril.parent = this.branch;
    console.log(this.koodibril.rotationQuaternion);
    this.koodibril.rotate(new Vector3(0, 1, 0), 1.5 * Math.PI);
    console.log(this.koodibril.rotationQuaternion);
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
}
