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
  ParticleSystem,
  Texture,
  VolumetricLightScatteringPostProcess,
  Camera,
  Engine,
  Material,
  StandardRenderingPipeline,
  DefaultRenderingPipeline,
  BlurPostProcess,
  Vector2,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { GridMaterial } from '@babylonjs/materials';

export interface Lights {
  sun: SpotLight,
  sunMesh: Mesh,
  sunMat: StandardMaterial,
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
  private firefly!: boolean;
  private particles!: ParticleSystem[];
  private vls?: VolumetricLightScatteringPostProcess;
  private moonvls?: VolumetricLightScatteringPostProcess;

  
  public constructor(private scene: Scene, private camera: Camera, private engine: Engine) {}

  // create all lights and the sun/moon
  public instantiateLights(): void {
    this.lights = <Lights>{};
    this.lights.ambiant = new HemisphericLight("DirectionalLight", new Vector3(0, 1, 0), this.scene);
    this.lights.ambiant.intensity = 1;
    this.lights.sun = new SpotLight("sunLight", Vector3.Zero(), new Vector3(0, -1, 0), Math.PI, 10, this.scene);
    this.lights.moon = new SpotLight("moonLight", Vector3.Zero(), new Vector3(0, -1, 0), Math.PI, 10, this.scene);
    this.lights.sunMat = new StandardMaterial("yellowMat", this.scene);
    const whiteMat = new StandardMaterial("whiteMat", this.scene);
    this.lights.sunMat.emissiveColor = Color3.Yellow();
    this.lights.sunMat.disableLighting = true;
    whiteMat.emissiveColor = new Color3(1, 1, 1);
    this.lights.sun.intensity = 1;
    this.lights.moon.intensity = 0.3;
    this.lights.sunMesh = MeshBuilder.CreateSphere("sunMesh", {diameter: 3});
    this.lights.moonMesh = MeshBuilder.CreateSphere("moonMesh", {diameter: 1.5});
    this.lights.sunMesh.material = this.lights.sunMat;
    this.lights.moonMesh.material = whiteMat;
    this.lights.sun.parent = this.lights.sunMesh;
    this.lights.moon.parent = this.lights.moonMesh;
    this.lights.sunMesh.position = new Vector3(0, 8, 4);
    this.lights.moonMesh.position = new Vector3(0, -8, 4);
    this.lights.moonMesh.applyFog = false;
    this.lights.sunMesh.applyFog = false;
    // vls disable msaa wich destroy the quality of the scene
    this.vls = new VolumetricLightScatteringPostProcess('vls', 2.0, this.camera, this.lights.sunMesh, 100, Texture.BILINEAR_SAMPLINGMODE, this.engine, false, this.scene);
    this.vls.exposure = 0.1;
    this.vls.decay = 0.95;
    this.vls.weight = 0.95;
    this.vls.density = 0.95;
    this.hour = 0;
    this.firefly = false;
    this.particles = [];
  }

  // function that will move the sun/moon
  public movestar(object: Mesh, from: Vector3, to: Vector3): void {
    const frameRate = 10;
    const xkeyFrames = [
      {
        frame: 0,
        value: from.x,
      },
      {
        frame: frameRate,
        value: to.x,
      },
    ];
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

    const xSlide = new Animation('xSlide', 'position.x', frameRate, Animation.ANIMATIONTYPE_FLOAT);
    const ySlide = new Animation('ySlide', 'position.y', frameRate, Animation.ANIMATIONTYPE_FLOAT);
    const zSlide = new Animation('zSlide', 'position.z', frameRate, Animation.ANIMATIONTYPE_FLOAT);

    xSlide.setKeys(xkeyFrames);
    ySlide.setKeys(ykeyFrames);
    zSlide.setKeys(zkeyFrames);
    const animations = [zSlide, ySlide, xSlide];
    this.scene.beginDirectAnimation(object, animations, 0, frameRate, false, 2);
  }

  // at each hour will set the position and the intensity of each lights
  // sunset at 6
  public day(delta: number): void {
    this.setFocus();
    if (delta === -1) {
      this.hour = this.hour === 0 ? 24 : this.hour - 1;
    } else {
      this.hour = this.hour === 24 ? 0 : this.hour + 1;
    }
    const sun_ang = this.hour * (Math.PI / 12);
    const sun_y = Math.round(0 + (10 * Math.cos(sun_ang)));
    const sun_z = Math.round(4 + (10 * Math.sin(sun_ang)));
    const moon_ang = ((this.hour === 18 ? 19 : this.hour === 6 ? 5 : this.hour) - 6) * (Math.PI / 12);
    const moon_x = 0 + (8 * Math.cos(moon_ang));
    const moon_y = 0 + (8 * Math.sin(moon_ang));
    let luminosity = ((sun_y + 20) / 20);
    //this.setVls();
    this.setFirefly();
    this.setSunColor();
    this.movestar(this.lights.sunMesh, this.lights.sunMesh.position, new Vector3(0, sun_y, sun_z));
    this.movestar(this.lights.moonMesh, this.lights.moonMesh.position, new Vector3(moon_x, moon_y, 14));
    if (luminosity > 1 || sun_y > 0) {
      luminosity = 1;
    } else if (luminosity === 0.5) {
      luminosity = 0.375;
    }
    if (this.hour === 18) {
      luminosity = 0.9;
    }
    if (this.hour === 5) {
      this.scene.fogColor = new Color3(0.9 * luminosity * 1.1, 0.9 * luminosity, 0.85 * luminosity);
      this.scene.clearColor = new Color4(0.9 * luminosity * 1.1, 0.9 * luminosity, 0.85 * luminosity, 1);
    } else if (this.hour === 6) {
      this.sunset();
    } else {
      this.scene.fogColor = new Color3(0.9 * luminosity, 0.9 * luminosity, 0.85 * luminosity);
      this.scene.clearColor = new Color4(0.9 * luminosity, 0.9 * luminosity, 0.85 * luminosity, 1);
    }
    this.lights.ambiant.intensity = 1 * luminosity;
    this.lights.groundLight.mainColor = new Color3(1 * luminosity, 1 * luminosity, 1 * luminosity);
  }

  public setVls(): void {
    switch (this.hour) {
      case 4:
        this.smoothVls(this.vls!, this.vls!.exposure, 0.1);
        break;
      case 5:
        this.smoothVls(this.vls!, this.vls!.exposure, 0.05);
        break;
      case 6:
        this.smoothVls(this.vls!, this.vls!.exposure, 0.1);
        break;
    }
  }

  public setSunColor(): void {
    switch (this.hour) {
      case 4:
        this.smoothColor(this.lights.sunMat, this.lights.sunMat.emissiveColor, new Color3(0.9, 0.9, 0.5));
        break;
      case 5:
        this.smoothColor(this.lights.sunMat, this.lights.sunMat.emissiveColor, new Color3(0.9, 0.9, 0.5));
        break;
      case 6:
        this.smoothColor(this.lights.sunMat, this.lights.sunMat.emissiveColor, new Color3(255/255,102/255,112/255));
        break;
      default:
        this.smoothColor(this.lights.sunMat, this.lights.sunMat.emissiveColor, new Color3(0.9, 0.9, 0.5));
    }
  }

  public smoothVls(object: VolumetricLightScatteringPostProcess, from: number, to: number): void {
    const frameRate = 100;
    const rkeyFrames = [
      {
        frame: 0,
        value: from,
      },
      {
        frame: frameRate,
        value: to,
      },
    ];

    const rSlide = new Animation('rSlide', 'exposure', frameRate, Animation.ANIMATIONTYPE_FLOAT);

    rSlide.setKeys(rkeyFrames);
    const animations = [rSlide];
    this.scene.beginDirectAnimation(object, animations, 0, frameRate, false, 2);
  }
  
  // function that will move the sun/moon
  public smoothColor(object: StandardMaterial, from: Color3, to: Color3): void {
    const frameRate = 100;
    const rkeyFrames = [
      {
        frame: 0,
        value: from.r,
      },
      {
        frame: frameRate,
        value: to.r,
      },
    ];
    const gkeyFrames = [
      {
        frame: 0,
        value: from.g,
      },
      {
        frame: frameRate,
        value: to.g,
      },
    ];
    const bkeyFrames = [
      {
        frame: 0,
        value: from.b,
      },
      {
        frame: frameRate,
        value: to.b,
      },
    ];

    const rSlide = new Animation('rSlide', 'emissiveColor.r', frameRate, Animation.ANIMATIONTYPE_FLOAT);
    const gSlide = new Animation('gSlide', 'emissiveColor.g', frameRate, Animation.ANIMATIONTYPE_FLOAT);
    const bSlide = new Animation('bSlide', 'emissiveColor.b', frameRate, Animation.ANIMATIONTYPE_FLOAT);

    rSlide.setKeys(rkeyFrames);
    gSlide.setKeys(gkeyFrames);
    bSlide.setKeys(bkeyFrames);
    const animations = [rSlide, gSlide, bSlide];
    this.scene.beginDirectAnimation(object, animations, 0, frameRate, false, 2);
  }
  
  public sunset(): void {
    const luminosity = 0.9;
    this.scene.fogColor = new Color3(0.9 * luminosity * 1.15, 0.9 * luminosity, 0.85 * luminosity);
    this.scene.clearColor = new Color4(0.9 * luminosity * 1.15, 0.9 * luminosity, 0.85 * luminosity, 1);
  }

  public setFirefly(): void {
    if (this.hour >= 10 && this.hour <= 13 && !this.firefly) {
      this.firefly = true;
      for (let z = 0; z <= 8; z = z + 4) {
        for (let x = -3; x <= 6; x = x + 3) {
          const particleSystem = new ParticleSystem("particles", 5, this.scene);
          particleSystem.particleTexture = new Texture("../../content/assets/textures/flare.png", this.scene);
          particleSystem.emitter = new Vector3(x, 0, z);
          particleSystem.color1 = new Color4(0, 1.0, 0, 1.0);
          particleSystem.color2 = new Color4(0, 1.0, 0, 1.0);
          particleSystem.gravity = new Vector3((Math.random() * (0.5 - -0.5) + -0.5), (Math.random() * (0.5 - -0.5) + -0.5), 0);
          particleSystem.minSize = 0.1;
          particleSystem.maxSize = 0.1;
          particleSystem.emitRate = 1;
          particleSystem.minLifeTime = 4;
          particleSystem.maxLifeTime = 4;
          particleSystem.start();
          this.particles.push(particleSystem);
        }
      }
    } else if (this.hour > 13 || this.hour < 10) {
      this.particles.forEach(element => {
        element.stop();
      });
      this.firefly = false;
      this.particles = [];
    }
  }

  public setFocus(): void {
    this.lights.sun.setDirectionToTarget(new Vector3(0, 0, 0));
    this.lights.moon.setDirectionToTarget(new Vector3(0, 0, 0));
  }

}