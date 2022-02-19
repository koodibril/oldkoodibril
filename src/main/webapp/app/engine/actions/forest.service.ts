import { Scene, SceneLoader, Vector3, AbstractMesh, AnimationGroup, AssetContainer } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

export interface Flower {
  animations: AnimationGroup[];
  meshe: AbstractMesh;
  color: AbstractMesh[];
}

export interface Pannel {
  animations: AnimationGroup[];
  meshe: AbstractMesh;
  color: AbstractMesh[];
}

export interface Bush {
  animations: AnimationGroup[];
  meshe: AbstractMesh;
  color: AbstractMesh[];
}

export interface Tree {
  animations: AnimationGroup[];
  meshe: AbstractMesh;
  color: AbstractMesh[];
}

export interface Trees {
  front: Tree[];
  middle: Tree[];
  back: Tree[];
  delete: Tree[];
}

export interface Bushes {
  front: Bush[];
  middle: Bush[];
  back: Bush[];
  delete: Bush[];
}

export interface Flowers {
  front: Flower;
  middle: Flower;
  back: Flower;
  delete: Flower;
}

export interface Forest {
  trees: Trees;
  flowers: Flowers;
  bushes: Bushes;
  pannel: Pannel;
}

export class ForestActions {
  // store all forest mesh and animation
  public forest!: Forest;
  // store the flower.glb for fast loading
  private flower!: AssetContainer;
  // store the 9 trees.glb for fast loading
  private trees!: AssetContainer[];
  // store the 4 bush.glb for fast loading
  private bushes!: AssetContainer[];
  // store the pannel.glb for fast loading
  private pannel!: AssetContainer;

  public constructor(private scene: Scene) {}

  // instantiate the forest object before filling it
  public async instantiateForest(): Promise<void> {
    this.forest = <Forest>{};
    this.forest.trees = <Trees>{};
    this.forest.bushes = <Bushes>{};
    this.forest.flowers = <Flowers>{};
    this.forest.pannel = <Pannel>{};

    this.forest.trees.front = [];
    this.forest.trees.middle = [];
    this.forest.trees.back = [];
    this.forest.trees.delete = [];
    this.forest.bushes.front = [];
    this.forest.bushes.middle = [];
    this.forest.bushes.back = [];
    this.forest.bushes.delete = [];
    this.forest.flowers.front = <Flower>{};
    this.forest.flowers.middle = <Flower>{};
    this.forest.flowers.back = <Flower>{};
    this.forest.flowers.delete = <Flower>{};
    await this.importforest();
    this.seed();
  }

  // import all forest.glb and store them for fast loading
  public async importforest(): Promise<void> {
    this.flower = await SceneLoader.LoadAssetContainerAsync('../../content/assets/models/', 'flower.glb', this.scene);
    this.pannel = await SceneLoader.LoadAssetContainerAsync('../../content/assets/models/', 'pannel.glb', this.scene);
    this.trees = [];
    this.bushes = [];
    for (let i = 1; i < 10; i++) {
      this.trees[i] = await SceneLoader.LoadAssetContainerAsync(
        '../../content/assets/models/forestv2/tree/',
        'tree' + i.toString() + 'v2.glb',
        this.scene
      );
      if (i < 5) {
        this.bushes[i] = await SceneLoader.LoadAssetContainerAsync(
          '../../content/assets/models/forestv2/bush/',
          'bush' + i.toString() + 'v2.glb',
          this.scene
        );
      }
    }
  }

  // create the forest on 3 rows
  public seed(): void {
    const random_tree = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    this.addpannel();
    this.addtree(new Vector3(-3, 0, 0), 0, random_tree[0]);
    this.addtree(new Vector3(4, 0, 0), 0, random_tree[1]);
    this.addtree(new Vector3(-6, 0, 4), 1, random_tree[2]);
    this.addtree(new Vector3(3, 0, 4), 1, random_tree[3]);
    this.addtree(new Vector3(5, 0, 4), 1, random_tree[4]);
    this.addtree(new Vector3(-4, 0, 8), 2, random_tree[5]);
    this.addtree(new Vector3(-3, 0, 8), 2, random_tree[6]);
    this.addtree(new Vector3(2, 0, 8), 2, random_tree[7]);
    this.addtree(new Vector3(5, 0, 8), 2, random_tree[8]);

    for (let z = 0; z <= 8; z = z + 4) {
      const random = this.shuffleArray([1, 2, 3, 4]);
      this.addbush(new Vector3(0, 0, z), z / 4, random[0]);
      this.addflower(new Vector3(Math.random() * (2 - -2) + -2, 1.5, z), z / 4);
    }
  }

  // suffle method for selecting randomly trees, or bushes
  public shuffleArray(array: Array<number>): Array<number> {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // add another instance of a flower in the forest
  public addflower(position: Vector3, row: number): void {
    const flowerImport = this.flower.instantiateModelsToScene();
    const flower = <Flower>{};
    flower.color = flowerImport.rootNodes[0].getChildMeshes();
    (flower.animations = flowerImport.animationGroups), (flower.meshe = flowerImport.rootNodes[0] as AbstractMesh);
    flower.animations[0].stop();
    flower.animations[0].start(false, 10.0);
    flower.animations[5].start(false, 10.0);
    flower.animations[3].start(false, 10.0);
    flower.meshe.scaling.scaleInPlace(0.2);
    flower.meshe.rotate(new Vector3(0, 1, 0), position.x < 0 ? Math.PI * 1.5 : Math.PI / 2);
    flower.meshe.position = position;
    flower.meshe.name = 'flower';
    flower.meshe.checkCollisions = true;
    switch (row) {
      case 0:
        this.forest.flowers.front = flower;
        break;
      case 1:
        this.forest.flowers.middle = flower;
        break;
      case 2:
        this.forest.flowers.back = flower;
        break;
    }
  }

  // add the pannel wich will nether move, only open and close
  public addpannel(): void {
    const pannelImport = this.pannel.instantiateModelsToScene();
    const pannel = <Pannel>{};
    (pannel.animations = pannelImport.animationGroups), (pannel.meshe = pannelImport.rootNodes[0] as AbstractMesh);
    pannel.meshe.scaling.scaleInPlace(1);
    pannel.meshe.rotate(new Vector3(0, 1, 0), Math.PI * 0.5);
    pannel.meshe.position = new Vector3(0, 4, 1);
    pannel.animations[0].goToFrame(0);
    pannel.animations[0].stop();
    pannel.animations[1].start(false, 10.0);
    pannel.meshe.name = 'pannel';
    this.forest.pannel = pannel;
  }

  // add another instance of bush on the forest
  public addbush(position: Vector3, row: number, mesh: number): void {
    const bushImport = this.bushes[mesh].instantiateModelsToScene();
    const bush = <Bush>{};
    bush.animations = bushImport.animationGroups;
    bush.color = bushImport.rootNodes[0].getChildMeshes();
    bush.meshe = bushImport.rootNodes[0] as AbstractMesh;
    bush.animations[0].goToFrame(0);
    bush.animations[0].stop();
    bush.animations[1].start(false, 10.0);
    bush.meshe.scaling.scaleInPlace(2.5);
    bush.meshe.rotate(new Vector3(0, 1, 0), Math.random() > 0.5 ? Math.PI * 1.5 : Math.PI / 2);
    bush.meshe.position = position;
    bush.meshe.name = 'bush';
    bush.meshe.checkCollisions = true;
    switch (row) {
      case 0:
        this.forest.bushes.front.push(bush);
        break;
      case 1:
        this.forest.bushes.middle.push(bush);
        break;
      case 2:
        this.forest.bushes.back.push(bush);
        break;
    }
  }

  // add another instance of a tree in the forest
  public addtree(position: Vector3, row: number, mesh: number): void {
    const treeImport = this.trees[mesh].instantiateModelsToScene();
    const tree = <Tree>{};
    (tree.animations = treeImport.animationGroups), (tree.color = treeImport.rootNodes[0].getChildMeshes().sort());
    tree.meshe = treeImport.rootNodes[0] as AbstractMesh;
    tree.animations[0].goToFrame(0);
    tree.animations[0].stop();
    tree.animations.sort();
    tree.animations[1].start(false, 10.0);
    tree.animations[3].start(false, 10.0);
    tree.meshe.scaling.scaleInPlace(2.5);
    tree.meshe.checkCollisions = true;
    tree.meshe.rotate(new Vector3(0, 1, 0), Math.PI * 1.5);
    tree.meshe.position = position;
    tree.meshe.name = 'tree';
    switch (row) {
      case 0:
        this.forest.trees.front.push(tree);
        break;
      case 1:
        this.forest.trees.middle.push(tree);
        break;
      case 2:
        this.forest.trees.back.push(tree);
        break;
    }
  }

  // add another row on front or back, set the arrays of the trees, bush and flower to be deleted
  public addRow(delta: number): void {
    if (delta === 1) {
      this.forest.bushes.delete = this.forest.bushes.back;
      this.forest.bushes.back = this.forest.bushes.middle;
      this.forest.bushes.middle = this.forest.bushes.front;
      this.forest.bushes.front = [];

      this.forest.flowers.delete = this.forest.flowers.back;
      this.forest.flowers.back = this.forest.flowers.middle;
      this.forest.flowers.middle = this.forest.flowers.front;
      this.forest.flowers.front = <Flower>{};

      this.forest.trees.delete = this.forest.trees.back;
      this.forest.trees.back = this.forest.trees.middle;
      this.forest.trees.middle = this.forest.trees.front;
      this.forest.trees.front = [];
    } else {
      this.forest.bushes.delete = this.forest.bushes.front;
      this.forest.bushes.front = this.forest.bushes.middle;
      this.forest.bushes.middle = this.forest.bushes.back;
      this.forest.bushes.back = [];

      this.forest.flowers.delete = this.forest.flowers.front;
      this.forest.flowers.front = this.forest.flowers.middle;
      this.forest.flowers.middle = this.forest.flowers.back;
      this.forest.flowers.back = <Flower>{};

      this.forest.trees.delete = this.forest.trees.front;
      this.forest.trees.front = this.forest.trees.middle;
      this.forest.trees.middle = this.forest.trees.back;
      this.forest.trees.back = [];
    }
    const random_tree = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const position = this.shuffleArray([-3, -6, 3, 5]);
    for (let i = 0; i < 4; i++) {
      if (i > 1) {
        this.addtree(new Vector3(i === 2 ? -8 : 8, delta === -1 ? -6 : 0, delta === -1 ? 12 : -4), delta === -1 ? 2 : 0, random_tree[i]);
      } else {
        this.addtree(new Vector3(position[i], delta === -1 ? -6 : 0, delta === -1 ? 12 : -4), delta === -1 ? 2 : 0, random_tree[i]);
      }
    }
    const random = this.shuffleArray([1, 2, 3, 4]);
    this.addflower(new Vector3(Math.random() * (2 - -2) + -2, delta === -1 ? -5 : 1.5, delta === -1 ? 12 : -4), delta === -1 ? 2 : 0);
    this.addbush(new Vector3(0, delta === -1 ? -5 : 0, delta === -1 ? 12 : -4), delta === -1 ? 2 : 0, random[0]);
  }

  // called at the end of scroll, will delete all mesh and destroy arrays of every mesh considered out of map (<4 || >12)
  public deleteRow(): void {
    for (let i = 0; i < 3; i++) {
      if (i === 0) {
        for (let j = 0; j < this.forest.trees.delete.length; j++) {
          this.forest.trees.delete[j].meshe.dispose();
          this.forest.trees.delete.shift();
          j = -1;
        }
      }
      if (i === 1) {
        for (let j = 0; j < this.forest.bushes.delete.length; j++) {
          this.forest.bushes.delete[j].meshe.dispose();
          this.forest.bushes.delete.shift();
          j = -1;
        }
      }
      if (i === 2) {
        this.forest.flowers.delete.meshe.dispose();
        this.forest.flowers.delete = <Flower>{};
      }
    }
  }
}
