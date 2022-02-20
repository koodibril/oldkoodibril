import { Scene, Mesh, Vector3, MeshBuilder } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui';
import '@babylonjs/loaders/glTF';

export interface Application {
  name: string;
  description: string;
  available: boolean;
}

export class textActions {
  public show!: boolean;
  public topText!: Mesh;
  public middleText!: Mesh;
  public bottomText!: Mesh;
  private applications: Application[];

  public constructor(private scene: Scene, private canvas: HTMLCanvasElement) {
    this.applications = [
      { name: 'KOODIBRIL', description: 'A simple colibri app', available: true },
      { name: 'MIES HOUSE', description: 'A simple logistic app', available: false },
      { name: 'UBEBEST', description: 'A simple eco app', available: false },
      { name: 'YOUR APP', description: 'COMMING SOON', available: false },
      { name: 'GRAPHIT', description: 'A simple db app', available: true },
      { name: 'BABYLON', description: 'A simple fps app', available: true },
      { name: 'CAMAGRU', description: 'A simple instagram app', available: true },
      { name: 'YOUR APP', description: 'COMMING SOON', available: false },
      { name: 'WOODART', description: 'A simple wordpress', available: true },
      { name: 'MATCHA', description: 'A simple match app', available: true },
      { name: 'CLEAN-APP', description: 'A simple clean app', available: true },
      { name: 'YOUR APP', description: 'COMMING SOON', available: false },
      { name: 'HYPERTUBE', description: 'A simple youtube app', available: false },
      { name: 'MUSICROOM', description: 'A simple deezer app', available: false },
      { name: 'BALANCINGBANK', description: 'A simple bank app', available: false },
      { name: 'YOUR APP', description: 'COMMING SOON', available: false },
      { name: "UNIQU'AIR", description: 'A simple radio app', available: false },
      { name: 'RED-TETRIS', description: 'A simple tetris app', available: false },
      { name: 'LEMIN', description: 'A simple ant app', available: false },
      { name: 'YOUR APP', description: 'COMMING SOON', available: false },
      { name: 'COREWAR', description: 'A simple war app', available: false },
      { name: 'PUSH_SWAP', description: 'A simple stack app', available: false },
      { name: 'YOUR APP', description: 'COMMING SOON', available: false },
      { name: 'YOUR APP', description: 'COMMING SOON', available: false },
    ];
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

    const textOnly = new TextBlock('textMid', this.applications[position].description);
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

    textOnly.isHitTestVisible = this.applications[position].available;

    textOnly.onPointerUpObservable.add(function () {
      alert('Top Menu clicked');
    });
    advancedTexture.addControl(textOnly);
    this.bottomText = BottomPlane;
  }
}
