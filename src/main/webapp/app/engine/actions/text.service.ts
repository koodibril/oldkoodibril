import { Scene, Mesh, Vector3, MeshBuilder } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui';
import '@babylonjs/loaders/glTF';

export class textActions {
  public show!: boolean;
  public topText!: Mesh;
  public middleText!: Mesh;
  public bottomText!: Mesh;

  public constructor(private scene: Scene, private canvas: HTMLCanvasElement) {}

  public generateTopText(text: string): void {
    const TopPlane = MeshBuilder.CreatePlane('plane2', { width: 2.9, height: 1.6 }, this.scene);
    TopPlane.isPickable = true;
    TopPlane.position = new Vector3(0.1, 3.6, 2.8);
    TopPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;

    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(TopPlane, 1000, 500);

    const textOnly = new TextBlock('textTop', text);
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

  public generateMiddleText(text: string): void {
    const MiddlePlane = MeshBuilder.CreatePlane('plane2', { width: 2.8, height: 1.4 }, this.scene);
    MiddlePlane.isPickable = true;
    MiddlePlane.position = new Vector3(0, 2.7, 2.8);
    MiddlePlane.billboardMode = Mesh.BILLBOARDMODE_ALL;

    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(MiddlePlane, 2000, 500);

    const textOnly = new TextBlock('textMid', text);
    textOnly.isPointerBlocker = true;
    textOnly.width = 2.8;
    textOnly.height = 1.4;
    textOnly.color = 'white';
    textOnly.fontSize = 140;
    textOnly.fontFamily = 'verdana';
    textOnly.hoverCursor = 'pointer';

    textOnly.isHitTestVisible = true;

    textOnly.onPointerUpObservable.add(function () {
      alert('Top Menu clicked');
    });
    advancedTexture.addControl(textOnly);
    this.middleText = MiddlePlane;
  }

  public generateBottomText(text: string): void {
    const BottomPlane = MeshBuilder.CreatePlane('plane2', { width: 2.8, height: 1.3 }, this.scene);
    BottomPlane.isPickable = true;
    BottomPlane.position = new Vector3(0, 1.98, 2.7);
    BottomPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;

    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(BottomPlane, 1000, 500);

    const textOnly = new TextBlock('textBot', text);
    textOnly.isPointerBlocker = true;
    textOnly.width = 2.8;
    textOnly.height = 1.3;
    textOnly.color = 'white';
    textOnly.fontSize = 140;
    textOnly.fontFamily = 'verdana';
    textOnly.hoverCursor = 'pointer';

    textOnly.isHitTestVisible = true;

    textOnly.onPointerUpObservable.add(function () {
      alert('Top Menu clicked');
    });
    advancedTexture.addControl(textOnly);
    this.bottomText = BottomPlane;
  }
}
