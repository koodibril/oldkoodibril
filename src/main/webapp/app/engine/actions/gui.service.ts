import {
    Scene,
    StandardMaterial,
    Mesh,
    Camera,
    Engine,
    AbstractMesh,
    PBRMaterial,
    Color3,
  } from '@babylonjs/core';
  import '@babylonjs/loaders/glTF';
  import { AdvancedDynamicTexture, ColorPicker, Control, StackPanel, TextBlock } from '@babylonjs/gui';
import { Trees } from './forest.service';

  export class GuiActions {
    private advancedTexture!: AdvancedDynamicTexture;
    private panelRight!: StackPanel;
    private panelLeft!: StackPanel;

  public constructor(private scene: Scene, private camera: Camera, private engine: Engine) {}

  public instantiateGui(): void {
    this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.panelRight = new StackPanel();
    this.panelRight.width = "200px";
    this.panelRight.isVertical = true;
    this.panelRight.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.panelRight.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this.advancedTexture.addControl(this.panelRight);
    this.panelLeft = new StackPanel();
    this.panelLeft.width = "200px";
    this.panelLeft.isVertical = true;
    this.panelLeft.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.panelLeft.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this.advancedTexture.addControl(this.panelLeft);
  }

  public reset(): void {
    this.panelLeft.dispose();
    this.panelRight.dispose();
    this.advancedTexture.dispose();
  }

  public createColorPannel(name: string, mesh: Mesh): void {
    const textBlock = new TextBlock();
    textBlock.text = name + "Color:";
    textBlock.height = "30px";
    this.panelRight.addControl(textBlock);
    const picker = new ColorPicker();
    picker.height = "150px";
    picker.width = "150px";
    picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    const initColor = mesh.material as StandardMaterial;
    picker.value = initColor.diffuseColor;
    const textBlock2 = new TextBlock();
    textBlock2.text = "Value:" + picker.value.toHexString();
    textBlock2.height = "30px";
    this.panelRight.addControl(textBlock2);
    picker.onValueChangedObservable.add(function(value) { // value is a color3
      const material = mesh.material as StandardMaterial;
      material.diffuseColor.copyFrom(value);
      mesh.material = material;
      textBlock2.text = "Value:" + value.toHexString();
    });
    this.panelRight.addControl(picker);
  }

  public createPBRColorPannel(name: string, mesh: AbstractMesh, left: boolean): void {
    const textBlock = new TextBlock();
    textBlock.text = name + "Color:";
    textBlock.height = "30px";
    left ? this.panelLeft.addControl(textBlock) : this.panelRight.addControl(textBlock);
    const picker = new ColorPicker();
    picker.height = "150px";
    picker.width = "150px";
    picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    const initColor = mesh.material as PBRMaterial;
    picker.value = initColor.albedoColor;
    const textBlock2 = new TextBlock();
    textBlock2.text = "Value:" + picker.value.toHexString();
    textBlock2.height = "30px";
    left ? this.panelLeft.addControl(textBlock2) : this.panelRight.addControl(textBlock2);
    picker.onValueChangedObservable.add(function(value) { // value is a color3
      const material = mesh.material as PBRMaterial;
      material.albedoColor.copyFrom(value);
      mesh.material = material;
      textBlock2.text = "Value:" + value.toHexString();
    });
    left ? this.panelLeft.addControl(picker) : this.panelRight.addControl(picker);
  }

  public createTreeColorPannel(name: string, trees: Trees, top: boolean): void {
    const textBlock = new TextBlock();
    textBlock.text = name + "Color:";
    textBlock.height = "30px";
    this.panelLeft.addControl(textBlock);
    const picker = new ColorPicker();
    picker.height = "150px";
    picker.width = "150px";
    picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    const initColor = top ? trees.front[0].color[3].subMeshes[0].getMesh().material as PBRMaterial : trees.front[0].color[1].subMeshes[0].getMesh().material as PBRMaterial;
    picker.value = initColor.albedoColor;
    const textBlock2 = new TextBlock();
    textBlock2.text = "Value:" + picker.value.toHexString();
    textBlock2.height = "30px";
    this.panelLeft.addControl(textBlock2);
    picker.onValueChangedObservable.add(function(value) { // value is a color3
      trees.front.forEach(element => {
        let material = top ? element.color[3].subMeshes[0].getMesh().material as PBRMaterial : element.color[1].subMeshes[0].getMesh().material as PBRMaterial;
        material.albedoColor.copyFrom(value);
        material = top ? element.color[2].subMeshes[0].getMesh().material as PBRMaterial : element.color[0].subMeshes[0].getMesh().material as PBRMaterial;
        material.albedoColor.copyFrom(value);
      });
      textBlock2.text = "Value:" + value.toHexString();
    });
    this.panelLeft.addControl(picker);
  }

  public createFogColorPannel(): void {
    const textBlock = new TextBlock();
    textBlock.text = "FogColor:";
    textBlock.height = "30px";
    this.panelRight.addControl(textBlock);
    const picker = new ColorPicker();
    picker.height = "150px";
    picker.width = "150px";
    picker.value = this.scene.fogColor;
    const textBlock2 = new TextBlock();
    textBlock2.text = "Value:" + picker.value.toHexString();
    textBlock2.height = "30px";
    this.panelRight.addControl(textBlock2);
    picker.onValueChangedObservable.add((value) => { // value is a color3
      this.scene.fogColor = value
      textBlock2.text = "Value:" + value.toHexString();
    });
    this.panelRight.addControl(picker);
  }

  public createAmbiantColorPannel(): void {
    const textBlock = new TextBlock();
    textBlock.text = "AmbiantColor:";
    textBlock.height = "30px";
    this.panelRight.addControl(textBlock);
    const picker = new ColorPicker();
    picker.height = "150px";
    picker.width = "150px";
    picker.value = new Color3(this.scene.clearColor.r, this.scene.clearColor.g, this.scene.clearColor.b);
    const textBlock2 = new TextBlock();
    textBlock2.text = "Value:" + picker.value.toHexString();
    textBlock2.height = "30px";
    this.panelRight.addControl(textBlock2);
    picker.onValueChangedObservable.add((value) => { // value is a color3
      this.scene.clearColor.r = value.r;
      this.scene.clearColor.g = value.g;
      this.scene.clearColor.b = value.b;
      textBlock2.text = "Value:" + value.toHexString();
    });
    this.panelRight.addControl(picker);
  }

  }