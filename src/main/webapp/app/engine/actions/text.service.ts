import { Scene, Mesh, Vector3, MeshBuilder } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui';
import '@babylonjs/loaders/glTF';
import { BehaviorSubject } from 'rxjs';
import * as FontFaceObserver from 'fontfaceobserver';
import { pannelInfo } from '../engine.component';

export interface Application {
  name: string;
  subtitle: string;
  logo: string;
  pictures: string[];
  description: string;
  link: string;
  git: string;
  technos: string[];
}

export const applications: Application[] = [
  {
    name: 'KOODIBRIL',
    subtitle: 'A simple colibri app',
    logo: 'https://koodibril.com/colibri.png',
    pictures: [
      'https://koodibril.com/colibri.png',
      'https://koodibril.com/colibri.png',
      'https://koodibril.com/colibri.png',
      'https://koodibril.com/colibri.png',
    ],
    // description: 'This app has for purpoose to display my work in a fun way',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
    link: 'https://koodibril.com',
    git: 'https://github.com/koodibril/koodibril',
    technos: [
      'devicon-angularjs-plain colored',
      'devicon-devicon-plain colored',
      'devicon-spring-plain colored',
      'devicon-mongodb-plain colored',
      'devicon-opengl-plain colored',
    ], // https://devicon.dev/
  },
  {
    name: 'MIES HOUSE',
    subtitle: 'A simple logistic app',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'UBEBEST',
    subtitle: 'A simple eco app',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'GRAPHIT',
    subtitle: 'A simple db app',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'BABYLON',
    subtitle: 'A simple fps app',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'CAMAGRU',
    subtitle: 'A simple instagram app',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'WOODART',
    subtitle: 'A simple wordpress',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'MATCHA',
    subtitle: 'A simple match app',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'CLEAN-APP',
    subtitle: 'A simple clean app',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'HYPERTUBE',
    subtitle: 'A simple youtube app',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'MUSICROOM',
    subtitle: 'A simple deezer app',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'BALANCINGBANK',
    subtitle: 'A simple bank app',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: "UNIQU'AIR",
    subtitle: 'A simple radio app',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'RED-TETRIS',
    subtitle: 'A simple tetris app',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'LEMIN',
    subtitle: 'A simple ant app',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'COREWAR',
    subtitle: 'A simple war app',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'PUSH_SWAP',
    subtitle: 'A simple stack app',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: '',
    pictures: [''],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
];

export class textActions {
  public show!: boolean;
  public topText!: Mesh;
  public middleText!: Mesh;
  public bottomText!: Mesh;
  public applications: Application[];

  public constructor(private scene: Scene, private canvas: HTMLCanvasElement, private appName: BehaviorSubject<pannelInfo>) {
    this.applications = applications;
    // create textblocks to load fonts
    Promise.all([new FontFaceObserver('jungleRoar').load(), new FontFaceObserver('Tommy').load()]);
  }

  public generateTopText(position: number): void {
    const TopPlane = MeshBuilder.CreatePlane('plane2', { width: 2.9, height: 1.6 }, this.scene);
    TopPlane.isPickable = true;
    TopPlane.position = new Vector3(0.1, 3.6, 2.8);
    TopPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;

    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(TopPlane, 2000, 1000);

    const textOnly = new TextBlock('textTop', this.applications[position].name);
    textOnly.isPointerBlocker = true;
    textOnly.width = 2.9;
    textOnly.height = 1.6;
    textOnly.color = 'white';
    textOnly.fontSize = 300;
    textOnly.fontFamily = 'jungleRoar';
    // textOnly.fontWeight;
    textOnly.isHitTestVisible = false;
    advancedTexture.addControl(textOnly);
    this.topText = TopPlane;
  }

  public generateMiddleText(position: number): void {
    const MiddlePlane = MeshBuilder.CreatePlane('plane2', { width: 2.8, height: 1.4 }, this.scene);
    MiddlePlane.isPickable = true;
    MiddlePlane.position = new Vector3(0, 2.7, 2.8);
    MiddlePlane.billboardMode = Mesh.BILLBOARDMODE_ALL;

    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(MiddlePlane, 2000, 1000);

    const textOnly = new TextBlock('textMid', this.applications[position].subtitle);
    textOnly.isPointerBlocker = true;
    textOnly.width = 2.8;
    textOnly.height = 1.4;
    textOnly.color = 'white';
    textOnly.fontSize = 140;
    textOnly.fontFamily = 'Tommy';
    textOnly.isHitTestVisible = false;
    advancedTexture.addControl(textOnly);
    this.middleText = MiddlePlane;
  }

  public generateBottomText(position: number, sens: boolean): void {
    const BottomPlane = MeshBuilder.CreatePlane('plane2', { width: 2.8, height: 1 }, this.scene);
    BottomPlane.isPickable = true;
    BottomPlane.position = new Vector3(0, 1.98, 2.5);
    BottomPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;

    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(BottomPlane, 2800, 1000);

    const textOnly = new TextBlock('textBot', 'More information');
    textOnly.isPointerBlocker = true;
    textOnly.width = 2.8;
    textOnly.height = 1;
    textOnly.color = 'white';
    textOnly.fontSize = 200;
    textOnly.fontFamily = 'Tommy';
    textOnly.hoverCursor = 'pointer';

    textOnly.isHitTestVisible = true;

    textOnly.onPointerUpObservable.add(() => {
      this.appName.next({ app: this.applications[position].name, side: sens });
    });
    advancedTexture.addControl(textOnly);
    this.bottomText = BottomPlane;
  }
}
