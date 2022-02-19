import { Scene, StandardMaterial, Mesh, Camera, Engine, AbstractMesh, PBRMaterial, Color3 } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { AdvancedDynamicTexture, Checkbox, ColorPicker, Control, StackPanel, TextBlock } from '@babylonjs/gui';
import { Forest, Trees } from './forest.service';
import { Lights } from './lights.service';

export class GuiActions {
  public show!: boolean;
  private advancedTexture!: AdvancedDynamicTexture;
  private panelRight!: StackPanel;
  private panelLeft!: StackPanel;
  private panel!: StackPanel;

  public constructor(
    private scene: Scene,
    private camera: Camera,
    private engine: Engine,
    private lights: Lights,
    private forest: Forest
  ) {}

  public instantiatePannelGui(): void {
    this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
    this.panel = new StackPanel();
    this.panel.width = '200px';
    this.panel.isVertical = true;
    this.panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.advancedTexture.addControl(this.panel);
    const textBlock = new TextBlock();
    textBlock.text = 'Show Colors';
    textBlock.height = '30px';
    this.panel.addControl(textBlock);
    const checkbox = new Checkbox();
    checkbox.width = '20px';
    checkbox.height = '20px';
    checkbox.isChecked = false;
    checkbox.color = 'green';
    checkbox.onIsCheckedChangedObservable.add(value => {
      this.show = value;
      if (value === true) {
        this.instantiateColorGui();
        this.createColorPannel('Sun', this.lights.sunMesh);
        this.createPBRColorPannel('Bush', this.forest.bushes.front[0].color[0].subMeshes[0].getMesh(), false);
        this.createPBRColorPannel('FlowerTop', this.forest.flowers.front.color[1].subMeshes[0].getMesh(), true);
        this.createPBRColorPannel('FlowerBot', this.forest.flowers.front.color[2].subMeshes[0].getMesh(), true);
        this.createTreeColorPannel('TreeBot', this.forest.trees, false);
        this.createTreeColorPannel('TreeTop', this.forest.trees, true);
        this.createFogColorPannel();
        this.createAmbiantColorPannel();
      } else {
        this.reset();
      }
    });
    this.panel.addControl(checkbox);
  }

  public instantiateColorGui(): void {
    this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
    this.panelRight = new StackPanel();
    this.panelRight.width = '200px';
    this.panelRight.isVertical = true;
    this.panelRight.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.panelRight.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this.advancedTexture.addControl(this.panelRight);
    this.panelLeft = new StackPanel();
    this.panelLeft.width = '200px';
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
    textBlock.text = name + 'Color:';
    textBlock.height = '30px';
    this.panelRight.addControl(textBlock);
    const picker = new ColorPicker();
    picker.height = '150px';
    picker.width = '150px';
    picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    const initColor = mesh.material as StandardMaterial;
    picker.value = initColor.diffuseColor;
    const textBlock2 = new TextBlock();
    textBlock2.text = 'Value:' + picker.value.toHexString();
    textBlock2.height = '30px';
    this.panelRight.addControl(textBlock2);
    picker.onValueChangedObservable.add(function (value) {
      // value is a color3
      const material = mesh.material as StandardMaterial;
      material.diffuseColor.copyFrom(value);
      mesh.material = material;
      textBlock2.text = 'Value:' + value.toHexString();
    });
    this.panelRight.addControl(picker);
  }

  public createPBRColorPannel(name: string, mesh: AbstractMesh, left: boolean): void {
    const textBlock = new TextBlock();
    textBlock.text = name + 'Color:';
    textBlock.height = '30px';
    left ? this.panelLeft.addControl(textBlock) : this.panelRight.addControl(textBlock);
    const picker = new ColorPicker();
    picker.height = '150px';
    picker.width = '150px';
    picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    const initColor = mesh.material as PBRMaterial;
    picker.value = initColor.albedoColor;
    const textBlock2 = new TextBlock();
    textBlock2.text = 'Value:' + picker.value.toHexString();
    textBlock2.height = '30px';
    left ? this.panelLeft.addControl(textBlock2) : this.panelRight.addControl(textBlock2);
    picker.onValueChangedObservable.add(function (value) {
      // value is a color3
      const material = mesh.material as PBRMaterial;
      material.albedoColor.copyFrom(value);
      mesh.material = material;
      textBlock2.text = 'Value:' + value.toHexString();
    });
    left ? this.panelLeft.addControl(picker) : this.panelRight.addControl(picker);
  }

  public createTreeColorPannel(name: string, trees: Trees, top: boolean): void {
    const textBlock = new TextBlock();
    textBlock.text = name + 'Color:';
    textBlock.height = '30px';
    this.panelLeft.addControl(textBlock);
    const picker = new ColorPicker();
    picker.height = '150px';
    picker.width = '150px';
    picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    const initColor = top
      ? (trees.front[0].color[3].subMeshes[0].getMesh().material as PBRMaterial)
      : (trees.front[0].color[1].subMeshes[0].getMesh().material as PBRMaterial);
    picker.value = initColor.albedoColor;
    const textBlock2 = new TextBlock();
    textBlock2.text = 'Value:' + picker.value.toHexString();
    textBlock2.height = '30px';
    this.panelLeft.addControl(textBlock2);
    picker.onValueChangedObservable.add(function (value) {
      // value is a color3
      trees.front.forEach(element => {
        let material = top
          ? (element.color[3].subMeshes[0].getMesh().material as PBRMaterial)
          : (element.color[1].subMeshes[0].getMesh().material as PBRMaterial);
        material.albedoColor.copyFrom(value);
        material = top
          ? (element.color[2].subMeshes[0].getMesh().material as PBRMaterial)
          : (element.color[0].subMeshes[0].getMesh().material as PBRMaterial);
        material.albedoColor.copyFrom(value);
      });
      textBlock2.text = 'Value:' + value.toHexString();
    });
    this.panelLeft.addControl(picker);
  }

  public createFogColorPannel(): void {
    const textBlock = new TextBlock();
    textBlock.text = 'FogColor:';
    textBlock.height = '30px';
    this.panelRight.addControl(textBlock);
    const picker = new ColorPicker();
    picker.height = '150px';
    picker.width = '150px';
    picker.value = this.scene.fogColor;
    const textBlock2 = new TextBlock();
    textBlock2.text = 'Value:' + picker.value.toHexString();
    textBlock2.height = '30px';
    this.panelRight.addControl(textBlock2);
    picker.onValueChangedObservable.add(value => {
      // value is a color3
      this.scene.fogColor = value;
      textBlock2.text = 'Value:' + value.toHexString();
    });
    this.panelRight.addControl(picker);
  }

  public createAmbiantColorPannel(): void {
    const textBlock = new TextBlock();
    textBlock.text = 'AmbiantColor:';
    textBlock.height = '30px';
    this.panelRight.addControl(textBlock);
    const picker = new ColorPicker();
    picker.height = '150px';
    picker.width = '150px';
    picker.value = new Color3(this.scene.clearColor.r, this.scene.clearColor.g, this.scene.clearColor.b);
    const textBlock2 = new TextBlock();
    textBlock2.text = 'Value:' + picker.value.toHexString();
    textBlock2.height = '30px';
    this.panelRight.addControl(textBlock2);
    picker.onValueChangedObservable.add(value => {
      // value is a color3
      this.scene.clearColor.r = value.r;
      this.scene.clearColor.g = value.g;
      this.scene.clearColor.b = value.b;
      textBlock2.text = 'Value:' + value.toHexString();
    });
    this.panelRight.addControl(picker);
  }
}
