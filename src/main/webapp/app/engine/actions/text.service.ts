import { Scene, Mesh, Vector3, MeshBuilder } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui';
import '@babylonjs/loaders/glTF';
import { BehaviorSubject } from 'rxjs';

export interface Application {
  name: string;
  subtitle: string;
  logo: URL;
  pictures: URL[];
  description: string;
  link: URL;
  technos: string[];
}

export const applications: Application[] = [
  {
    name: 'KOODIBRIL',
    subtitle: 'A simple colibri app',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'MIES HOUSE',
    subtitle: 'A simple logistic app',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'UBEBEST',
    subtitle: 'A simple eco app',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'GRAPHIT',
    subtitle: 'A simple db app',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'BABYLON',
    subtitle: 'A simple fps app',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'CAMAGRU',
    subtitle: 'A simple instagram app',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'WOODART',
    subtitle: 'A simple wordpress',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'MATCHA',
    subtitle: 'A simple match app',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'CLEAN-APP',
    subtitle: 'A simple clean app',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'HYPERTUBE',
    subtitle: 'A simple youtube app',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'MUSICROOM',
    subtitle: 'A simple deezer app',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'BALANCINGBANK',
    subtitle: 'A simple bank app',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: "UNIQU'AIR",
    subtitle: 'A simple radio app',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'RED-TETRIS',
    subtitle: 'A simple tetris app',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'LEMIN',
    subtitle: 'A simple ant app',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'COREWAR',
    subtitle: 'A simple war app',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'PUSH_SWAP',
    subtitle: 'A simple stack app',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: new URL(''),
    pictures: [new URL('')],
    description: '',
    link: new URL(''),
    technos: [],
  },
];

export class textActions {
  public show!: boolean;
  public topText!: Mesh;
  public middleText!: Mesh;
  public bottomText!: Mesh;
  public applications: Application[];

  public constructor(private scene: Scene, private canvas: HTMLCanvasElement, private appName: BehaviorSubject<string>) {
    this.applications = applications;
  }

  public generateTopText(position: number): void {
    const TopPlane = MeshBuilder.CreatePlane('plane2', { width: 2.9, height: 1.6 }, this.scene);
    TopPlane.isPickable = true;
    TopPlane.position = new Vector3(0.1, 3.6, 2.8);
    TopPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;

    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(TopPlane, 2000, 500);

    const textOnly = new TextBlock('textTop', this.applications[position].name);
    textOnly.isPointerBlocker = true;
    textOnly.width = 2.9;
    textOnly.height = 1.6;
    textOnly.color = 'white';
    textOnly.fontSize = 200;
    textOnly.fontStyle = 'bold';
    textOnly.fontFamily = 'verdana';
    textOnly.isHitTestVisible = false;
    advancedTexture.addControl(textOnly);
    this.topText = TopPlane;
  }

  public generateMiddleText(position: number): void {
    const MiddlePlane = MeshBuilder.CreatePlane('plane2', { width: 2.8, height: 1.4 }, this.scene);
    MiddlePlane.isPickable = true;
    MiddlePlane.position = new Vector3(0, 2.7, 2.8);
    MiddlePlane.billboardMode = Mesh.BILLBOARDMODE_ALL;

    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(MiddlePlane, 2000, 500);

    const textOnly = new TextBlock('textMid', this.applications[position].subtitle);
    textOnly.isPointerBlocker = true;
    textOnly.width = 2.8;
    textOnly.height = 1.4;
    textOnly.color = 'white';
    textOnly.fontSize = 140;
    textOnly.fontFamily = 'verdana';
    textOnly.isHitTestVisible = false;
    advancedTexture.addControl(textOnly);
    this.middleText = MiddlePlane;
  }

  public generateBottomText(position: number): void {
    const BottomPlane = MeshBuilder.CreatePlane('plane2', { width: 2.8, height: 1.3 }, this.scene);
    BottomPlane.isPickable = true;
    BottomPlane.position = new Vector3(0, 1.98, 2.7);
    BottomPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;

    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(BottomPlane, 1000, 500);

    const textOnly = new TextBlock('textBot', 'More information');
    textOnly.isPointerBlocker = true;
    textOnly.width = 2.8;
    textOnly.height = 1.3;
    textOnly.color = 'white';
    textOnly.fontSize = 140;
    textOnly.fontFamily = 'verdana';
    textOnly.hoverCursor = 'pointer';

    textOnly.isHitTestVisible = true;

    textOnly.onPointerUpObservable.add(() => {
      this.appName.next(this.applications[position].name);
    });
    advancedTexture.addControl(textOnly);
    this.bottomText = BottomPlane;
  }
}
