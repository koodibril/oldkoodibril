import {
  Scene,
  MeshBuilder,
  Color4,
  Vector3,
  HemisphericLight,
  Animation,
  Color3,
  StandardMaterial,
  SpotLight,
  Mesh,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { GridMaterial } from '@babylonjs/materials';

export interface Lights {
  sun: SpotLight,
  sunMesh: Mesh,
  moon: SpotLight,
  moonMesh: Mesh,
  ambiant: HemisphericLight,
  groundLight: GridMaterial
}

export class LightsActions {
  // store all lights
  public lights!: Lights;
  // set the hour of the day on 24
  private hour!: number;
  
  public constructor(private scene: Scene) {}

  // create all lights and the sun/moon
  public instantiateLights(): void {
    this.lights = <Lights>{};
    this.lights.ambiant = new HemisphericLight("DirectionalLight", new Vector3(0, 1, 0), this.scene);
    this.lights.ambiant.intensity = 1;
    this.lights.sun = new SpotLight("sunLight", Vector3.Zero(), new Vector3(0, -1, 0), Math.PI, 1, this.scene);
    this.lights.moon = new SpotLight("moonLight", Vector3.Zero(), new Vector3(0, -1, 0), Math.PI, 1, this.scene);
    const yellowMat = new StandardMaterial("yellowMat", this.scene);
    const whiteMat = new StandardMaterial("whiteMat", this.scene);
    yellowMat.emissiveColor = Color3.Yellow();
    whiteMat.emissiveColor = Color3.White();
    this.lights.sun.diffuse = Color3.Yellow();
    this.lights.moon.diffuse = Color3.White();
    this.lights.sunMesh = MeshBuilder.CreateSphere("sunMesh", {diameter: 1.5});
    this.lights.moonMesh = MeshBuilder.CreateSphere("moonMesh", {diameter: 1.5});
    this.lights.sunMesh.material = yellowMat;
    this.lights.moonMesh.material = whiteMat;
    this.lights.sun.parent = this.lights.sunMesh;
    this.lights.moon.parent = this.lights.moonMesh;
    this.lights.sunMesh.position = new Vector3(0, 10, 4);
    this.lights.moonMesh.position = new Vector3(0, -10, 4);
    this.hour = 5;
  }

  // function that will move the sun/moon
  public movestar(object: Mesh, from: Vector3, to: Vector3): void {
    const frameRate = 10;
    const ykeyFrames = [
      {
        frame: 0,
        value: from.y,
      },
      {
        frame: frameRate,
        value: to.y,
      },
    ];
    const zkeyFrames = [
      {
        frame: 0,
        value: from.z,
      },
      {
        frame: frameRate,
        value: to.z,
      },
    ];

    const ySlide = new Animation('ySlide', 'position.y', frameRate, Animation.ANIMATIONTYPE_FLOAT);
    const zSlide = new Animation('zSlide', 'position.z', frameRate, Animation.ANIMATIONTYPE_FLOAT);

    ySlide.setKeys(ykeyFrames);
    zSlide.setKeys(zkeyFrames);
    const animations = [zSlide, ySlide];
    this.scene.beginDirectAnimation(object, animations, 0, frameRate, false, 2);
  }

  // at each hour will set the position and the intensity of each lights
  public day(delta: number): void {
    if (delta === -1) {
      this.hour = this.hour === 0 ? 9 : this.hour - 1;
    } else {
      this.hour = this.hour === 9 ? 0 : this.hour + 1;
    }
    console.log(this.hour);
    switch (this.hour) {
      case 0:
        this.lights.ambiant.intensity = 0;
        this.scene.fogColor = new Color3(0, 0, 0);
        this.scene.clearColor = new Color4(0, 0, 0, 1);
        this.lights.groundLight.mainColor = new Color3(0, 0, 0);
        this.movestar(this.lights.sunMesh, this.lights.sunMesh.position, new Vector3(0, -10, 4));
        this.movestar(this.lights.moonMesh, this.lights.moonMesh.position, new Vector3(0, 10, 4));
      break;
      case 1:
        this.lights.ambiant.intensity = 0.2;
        this.scene.fogColor = new Color3(0.2, 0.2, 0.2);
        this.scene.clearColor = new Color4(0.2, 0.2, 0.2, 1);
        this.lights.groundLight.mainColor = new Color3(0.2, 0.2, 0.2);
        this.movestar(this.lights.sunMesh, this.lights.sunMesh.position, new Vector3(0, -10, 8));
        this.movestar(this.lights.moonMesh, this.lights.moonMesh.position, new Vector3(0, 10, -8));
      break;
      case 2:
        this.lights.ambiant.intensity = 0.4;
        this.scene.fogColor = new Color3(0.4, 0.4, 0.4);
        this.scene.clearColor = new Color4(0.4, 0.4, 0.4, 1);
        this.lights.groundLight.mainColor = new Color3(0.4, 0.4, 0.4);
        this.movestar(this.lights.sunMesh, this.lights.sunMesh.position, new Vector3(0, -4, 12));
        this.movestar(this.lights.moonMesh, this.lights.moonMesh.position, new Vector3(0, 4, -12));
      break;
      case 3:
        this.lights.ambiant.intensity = 0.6;
        this.scene.fogColor = new Color3(0.6, 0.6, 0.6);
        this.scene.clearColor = new Color4(0.6, 0.6, 0.6, 1);
        this.lights.groundLight.mainColor = new Color3(0.6, 0.6, 0.6);
        this.movestar(this.lights.sunMesh, this.lights.sunMesh.position, new Vector3(0, 1, 12));
        this.movestar(this.lights.moonMesh, this.lights.moonMesh.position, new Vector3(0, -1, -12));
      break;
      case 4:
        this.lights.ambiant.intensity = 0.8;
        this.scene.fogColor = new Color3(0.8, 0.8, 0.8);
        this.scene.clearColor = new Color4(0.8, 0.8, 0.8, 1);
        this.lights.groundLight.mainColor = new Color3(0.8, 0.8, 0.8);
        this.movestar(this.lights.sunMesh, this.lights.sunMesh.position, new Vector3(0, 4, 12));
        this.movestar(this.lights.moonMesh, this.lights.moonMesh.position, new Vector3(0, -4, -12));
      break;
      case 5:
        this.lights.ambiant.intensity = 1;
        this.scene.fogColor = new Color3(0.9, 0.9, 0.85);
        this.scene.clearColor = new Color4(1, 1, 1, 1);
        this.lights.groundLight.mainColor = new Color3(1, 1, 1);
        this.movestar(this.lights.sunMesh, this.lights.sunMesh.position, new Vector3(0, 10, 4));
        this.movestar(this.lights.moonMesh, this.lights.moonMesh.position, new Vector3(0, -10, 4));
      break;
      case 6:
        this.lights.ambiant.intensity = 0.8;
        this.scene.fogColor = new Color3(0.8, 0.8, 0.8);
        this.scene.clearColor = new Color4(0.8, 0.8, 0.8, 1);
        this.lights.groundLight.mainColor = new Color3(0.8, 0.8, 0.8);
        this.movestar(this.lights.sunMesh, this.lights.sunMesh.position, new Vector3(0, 4, -12));
        this.movestar(this.lights.moonMesh, this.lights.moonMesh.position, new Vector3(0, -4, 12));
      break;
      case 7:
        this.lights.ambiant.intensity = 0.6;
        this.scene.fogColor = new Color3(0.6, 0.6, 0.6);
        this.scene.clearColor = new Color4(0.6, 0.6, 0.6, 1);
        this.lights.groundLight.mainColor = new Color3(0.6, 0.6, 0.6);
        this.movestar(this.lights.sunMesh, this.lights.sunMesh.position, new Vector3(0, 1, -12));
        this.movestar(this.lights.moonMesh, this.lights.moonMesh.position, new Vector3(0, -1, 12));
      break;
      case 8:
        this.lights.ambiant.intensity = 0.4;
        this.scene.fogColor = new Color3(0.4, 0.4, 0.4);
        this.scene.clearColor = new Color4(0.4, 0.4, 0.4, 1);
        this.lights.groundLight.mainColor = new Color3(0.4, 0.4, 0.4);
        this.movestar(this.lights.sunMesh, this.lights.sunMesh.position, new Vector3(0, -4, -12));
        this.movestar(this.lights.moonMesh, this.lights.moonMesh.position, new Vector3(0, 4, 12));
      break;
      case 9:
        this.lights.ambiant.intensity = 0.2;
        this.scene.fogColor = new Color3(0.2, 0.2, 0.2);
        this.scene.clearColor = new Color4(0.2, 0.2, 0.2, 1);
        this.lights.groundLight.mainColor = new Color3(0.2, 0.2, 0.2);
        this.movestar(this.lights.sunMesh, this.lights.sunMesh.position, new Vector3(0, -10, -8));
        this.movestar(this.lights.moonMesh, this.lights.moonMesh.position, new Vector3(0, 10, 8));
      break;
    }
  }

}