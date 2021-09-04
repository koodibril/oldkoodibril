import {
  Scene,
  SceneLoader,
  Color4,
  Vector3,
  Animation,
  Animatable,
  AbstractMesh,
  AnimationGroup,
  ParticleSystem,
  Texture,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { Forest } from './forest.service';

export interface Koodibril {
  mesh: AbstractMesh,
  leftoright: boolean,
  animation: AnimationGroup[],
  material: AbstractMesh,
  lastFly: Animatable
}

export class AnimationsActions {
  // true is the flower is opening and until she is fully open
  public loading!: boolean;
  // the colibri mesh, used for deplacement
  public koodibril!: Koodibril;
  // the particle system when flower is open
  private particle!: ParticleSystem;
  public constructor(private scene: Scene, private forest: Forest) {}

  public async initiateAnimation(): Promise<void> {
    this.koodibril = <Koodibril>{};
    const colibri = await SceneLoader.ImportMeshAsync('', '../../content/assets/models/', 'koodibril.glb', this.scene);
    colibri.animationGroups[0].stop();
    colibri.animationGroups[0].start(true, 10.0);
    this.koodibril.mesh = colibri.meshes[0];
    this.koodibril.material = colibri.meshes[1];
    this.koodibril.animation = colibri.animationGroups;
    this.koodibril.mesh.scaling.scaleInPlace(0.13);
    this.koodibril.mesh.position.y = 2;
    this.koodibril.mesh.position.z = 0;
    this.koodibril.mesh.rotate(new Vector3(0, 1, 0), 1.5 * Math.PI);
    this.koodibril.leftoright = true;
    this.loading = false;
    this.fly();
  }

  // general fonction used to slide an object in 3 axis
  public slideObject(object: any, from: Vector3, to: Vector3, speed: number): Animatable {
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
    const animations = [xSlide, zSlide, ySlide];
    return this.scene.beginDirectAnimation(object, animations, 0, frameRate, false, speed);
  }

  
  // generate random movements for the colibri, will call itself at the end of the last animations
  // to stop the fly always clean all observables, if not you will have double fly wich makes it jumpy
  public fly(): void {
    const frameRate = 20;
    const xtravel = Math.floor(Math.random() * (2 - -1) + -1) / Math.floor(Math.random() * 3 + 2);
    const ytravel = (Math.floor(Math.random() * (2 - -1) + -1) / Math.floor(Math.random() * 3 + 2)) + 2;
    if (this.koodibril.mesh.position.x > xtravel && !this.koodibril.leftoright) {
      this.koodibril.mesh.rotate(new Vector3(0, 1, 0), Math.PI);
      this.koodibril.leftoright = true;
    } else if (this.koodibril.mesh.position.x < xtravel && this.koodibril.leftoright) {
      this.koodibril.mesh.rotate(new Vector3(0, 1, 0), Math.PI);
      this.koodibril.leftoright = false;
    }
    const xkeyFrames = [
      {
        frame: 0,
        value: this.koodibril.mesh.position.x,
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
        value: this.koodibril.mesh.position.y,
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
    this.koodibril.lastFly = this.scene.beginDirectAnimation(this.koodibril.mesh, animations, 0, frameRate, false, 1);
    this.koodibril.lastFly.onAnimationEndObservable.addOnce(() => {
      this.fly();
  });
}


  // animate the colibri to go to the flower
  public goToFlower(): void {
    this.koodibril.lastFly.stop();
    this.koodibril.lastFly.onAnimationEndObservable.clear();
    const flowerPos = this.forest.flowers.front.meshe.position;
    if (flowerPos.x < 0 && !this.koodibril.leftoright) {
      this.koodibril.mesh.rotate(new Vector3(0, 1, 0), Math.PI);
      this.koodibril.leftoright = true;
    }
    if (flowerPos.x > 0 && this.koodibril.leftoright) {
      this.koodibril.mesh.rotate(new Vector3(0, 1, 0), Math.PI);
      this.koodibril.leftoright = false;
    }
    this.slideObject(this.koodibril.mesh, this.koodibril.mesh.position, new Vector3(flowerPos.x + (flowerPos.x < 0 ? 0.7 : -0.7), 1.7, this.koodibril.mesh.position.z), 2).onAnimationEndObservable.add(() => {
      this.koodibril.animation[0].stop();
      this.koodibril.animation[1].start(true, 10);
    });
  }

  

  // initiante the particle system
  public start_particle(): void {
    const flowerPos =this.forest.flowers.front.meshe.position;
    this.particle = new ParticleSystem("particles", 2000, this.scene);
    this.particle.particleTexture = new Texture("../../content/assets/textures/flare.png", this.scene);
    this.particle.emitter = new Vector3(flowerPos.x > 0 ? flowerPos.x - 0.16 : flowerPos.x + 0.16, flowerPos.y - 0.1, flowerPos.z);
    this.particle.createSphereEmitter(0.001, 0);
    this.particle.color1 = new Color4(1.0, 0, 0, 1.0);
    this.particle.color2 = new Color4(1.0, 0, 0, 1.0);
    this.particle.minSize = 0.05;
    this.particle.maxSize = 0.05;
    this.particle.emitRate = 500;
    this.particle.minLifeTime = 0.1;
    this.particle.maxLifeTime = 0.1;
    this.particle.start();
  }

  // stop the particle system
  public stop_particle(): void {
    this.particle.stop();
    this.particle.reset();
  }

  // stop all flower animations
  public stop_flower(): void {
    this.forest.flowers.front.animations.forEach(element => {
      element.stop();
    });
  }

  // launch the flower animations
  public deploy_flower(): void {
    this.stop_flower();
    this.forest.flowers.front.animations[2].start(false, 1).onAnimationEndObservable.add(() => {
      this.forest.flowers.front.animations[4].start(false, 1);
      this.forest.flowers.front.animations[6].start(false, 1);
    });
  }

  // close the flower beautifully
  public retract_flower(): void {
    this.stop_flower()
    this.forest.flowers.front.animations[5].start(false, 1);
    this.forest.flowers.front.animations[3].start(false, 1).onAnimationEndObservable.add(() => {
      this.forest.flowers.front.animations[0].start(false, 1);
    });
  }

  // close the flower fast, called whith scroll
  public retract_fast_flower(): void {
    this.forest.flowers.front.animations[5].start(false, 0.5);
    this.forest.flowers.front.animations[3].start(false, 2);
    this.forest.flowers.front.animations[0].start(false, 0.5);
  }

  // stop all tree animation
  public stop_tree(): void {
    this.forest.trees.front.forEach(element => {
      element.animations.forEach(element2 => {
        element2.stop();
      });
    })
  }

  // start the deploying tree animations
  public deploy_tree(): void {
    this.stop_tree();
    for (let i = 0; i < this.forest.trees.front.length; i++) {
      this.forest.trees.front[i].animations[0].start(false, 0.3);
      this.forest.trees.front[i].animations[2].start(false, 0.3);
    }
  }

  // start the retract tree animations
  public retract_tree(): void {
    this.stop_tree();
    for (let i = 0; i < this.forest.trees.front.length; i++) {
      this.forest.trees.front[i].animations[0].stop();
      this.forest.trees.front[i].animations[2].stop();
      this.forest.trees.front[i].animations[1].start(false, 0.5);
      this.forest.trees.front[i].animations[3].start(false, 0.5);
    }
  }

  // stop all bush animations
  public stop_bush(): void {
    this.forest.bushes.front.forEach(element => {
      element.animations.forEach(element2 => {
        element2.stop();
      });
    })
  }

  // start the deploying bush animations
  public deploy_bush(): void {
    this.stop_bush();
    this.forest.bushes.front.forEach(element => {
      element.animations[0].start(false, 0.3).onAnimationEndObservable.add(() => {
        this.loading = false;
      });
    });
  }

  // start the retracting bush animations
  public retract_bush(): void {
    this.stop_bush();
    this.forest.bushes.front.forEach(element => {
      element.animations[0].stop();
      element.animations[1].start(false, 0.5);
    });
  }

}