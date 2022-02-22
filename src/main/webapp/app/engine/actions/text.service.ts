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
    // description: "This app has for purpoose to display my work in a fun way",
    description:
      "Portfolio sous babylonjs, une librairie travaillant avec webGl, qui permet l'utilisation \
      de l'acceleration graphique pour le rendu d'une page web. Dans ce projet, j'ai egalement realiser \
      l'integralite des modeles 3D sous blender, ainsi que leurs animations. La generation de la foret \
      est effectuer de maniere aleatoire a chaque generation de rangs. Il existe exactement ",
    link: 'https://koodibril.com',
    git: 'https://github.com/koodibril/koodibril',
    technos: [
      'devicon-angularjs-plain-wordmark colored',
      'devicon-devicon-plain-wordmark colored',
      'devicon-spring-plain-wordmark colored',
      'devicon-mongodb-plain-wordmark colored',
      'devicon-opengl-plain-wordmark colored',
    ],
  },
  {
    name: 'MIES HOUSE',
    subtitle: 'A simple logistic app',
    logo: '',
    pictures: [],
    description:
      "Développer de nouvelles fonctionnalités, veiller a la robustesse, a l'extensibilité \
    et a la reutilisabilité du code. Mettre en place le CI/CD a l'aide de github action, ansible, gcp \
    et kubernetes. Mise a jour de la messagerie instantanée, \
    Réaliser un serveur mail en lien avec la messagerie instantanée, \
    Aider au développement de fonctionnalités diverses front (angular) et back (spring)",
    link: 'https://mieshouse.com/',
    git: '',
    technos: [
      'devicon-angularjs-plain-wordmark colored',
      'devicon-spring-plain-wordmark colored',
      'devicon-postgresql-plain-wordmark colored',
      'devicon-googlecloud-plain-wordmark colored',
    ],
  },
  {
    name: 'UBEBEST',
    subtitle: 'A simple eco app',
    logo: 'https://ubebest.com/wp-content/uploads/2021/08/logo.png',
    pictures: [],
    description:
      "Amelioration du backend, migration de scripts sous gcp afin de repartir la charge \
    du serveur, creation d'un module strapi pour controler le serveur de scripts, et les lancer si \
    necessaires. Mise a jour des scrappers. Mise a jour des scripts de calcul d'ecoscore, realisation \
    de scripts de congregation de donnees. Creation d'un module strapi d'import et d'export de donnees",
    link: 'https://ubebest.com/',
    git: '',
    technos: [
      'devicon-react-original-wordmark colored',
      'devicon-nodejs-plain-wordmark colored',
      'devicon-postgresql-plain-wordmark colored',
      'devicon-googlecloud-plain-wordmark colored',
    ],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: '',
    pictures: [],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'GRAPHIT',
    subtitle: 'A simple db app',
    logo: 'http://demo.graph-it.fr/static/media/Logo.8afff936.png',
    pictures: [],
    description:
      "Reprise du projet abandonne par deux developpeurs, remise a neuf du site, \
    correction de toutes les fonctionnalites implementes mais compromises. Developpement de nouvelles \
    fonctionnalites majeures, la modification des cases type 'Excel', l'import et l'export des csv \
    amelioration de la cartographie.",
    link: 'http://demo.graph-it.fr',
    git: '',
    technos: [
      'devicon-react-original-wordmark colored',
      'devicon-d3js-plain colored',
      'devicon-nodejs-plain-wordmark colored',
      'devicon-neo4j-plain-wordmark colored',
    ],
  },
  {
    name: 'BABYLON',
    subtitle: 'A simple fps app',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/0/0d/Logo_OpenClassrooms.png',
    pictures: [],
    description: "Tuto d'initiation a l'openGl avec la librairie babylonjs, plus d'information \
    sur openclassroom",
    link: 'https://babylon.koodibril.com/',
    git: 'https://github.com/koodibril/babylon',
    technos: ['devicon-javascript-plain colored', 'devicon-nodejs-plain-wordmark colored', 'devicon-opengl-plain-wordmark colored'],
  },
  {
    name: 'CAMAGRU',
    subtitle: 'A simple instagram app',
    logo: '',
    pictures: [],
    description: "Projet web, ou l'objectif est de realiser une simple copie d'instagram.",
    link: 'https://camagru.koodibril.com/',
    git: 'https://github.com/koodibril/camagru',
    technos: ['devicon-php-plain colored', 'devicon-mysql-plain-wordmark colored'],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: '',
    pictures: [],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'WOODART',
    subtitle: 'A simple wordpress',
    logo: '',
    pictures: [],
    description:
      "Realisation d'un wordpress simple pour mettre en avant les tableaux d'un artiste \
    (@passat_woodart) et lui permettre d'ajouter lui meme ces nouveaux tableau.",
    link: 'https://passat-woodart.koodibril.com/',
    git: '',
    technos: ['devicon-wordpress-plain-wordmark colored', 'devicon-mysql-plain colored'],
  },
  {
    name: 'MATCHA',
    subtitle: 'A simple match app',
    logo: '',
    pictures: [],
    description: "Projet web, ou l'objectif est de realiser une simple copie de tinder.",
    link: '',
    git: '',
    technos: ['devicon-react-original-wordmark colored', 'devicon-nodejs-plain-wordmark colored', 'devicon-neo4j-plain-wordmark colored'],
  },
  {
    name: 'CLEAN-APP',
    subtitle: 'A simple clean app',
    logo: 'https://raw.githubusercontent.com/AlphaBril/clean-app/main/files/MrPropre.png',
    pictures: [],
    description:
      "Un script bash, utiliser pour generer le squelette d'un application type MERN avec de \
    bonnes pratiques (typescript, eslint, redux, etc). Implemente de nombreuses technologies Cf lien Github",
    link: '',
    git: 'https://github.com/AlphaBril/clean-app',
    technos: [],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: '',
    pictures: [],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'HYPERTUBE',
    subtitle: 'A simple youtube app',
    logo: '',
    pictures: [],
    description: "Projet web, ou l'objectif est de realiser une simple copie de youtube.",
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'MUSICROOM',
    subtitle: 'A simple deezer app',
    logo: '',
    pictures: [],
    description: "Projet web, ou l'objectif est de realiser une simple copie de deezer.",
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'BALANCINGBANK',
    subtitle: 'A simple bank app',
    logo: '',
    pictures: [],
    description:
      "Projet web, ou l'objectif est de realiser une application capable de recupere \
    les releves de compts sous format pdf, pour les traiter et mettre en avant les depenses \
    mensuelles de l'utilisateur",
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: '',
    pictures: [],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: "UNIQU'AIR",
    subtitle: 'A simple radio app',
    logo: '',
    pictures: [],
    description:
      "Projet web, ou l'objectif est de realiser une radio web utilisant la blockchain \
    et l'api spotify, pour assurer l'auditeur qu'il n'ecouterat jamais la meme musique.",
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'RED-TETRIS',
    subtitle: 'A simple tetris app',
    logo: '',
    pictures: [],
    description:
      "Projet web, ou l'objectif est de realiser une copie ameliorer de tetris afin de \
    permettre aux joueurs de s'affronter en ligne",
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'LEMIN',
    subtitle: 'A simple ant app',
    logo: '',
    pictures: [],
    description:
      "Projet dont l'objectif est de realiser un algorithme permettant aux 'fourmis' \
    de traverser leurs 'fourmilieres' selon le chemin le plus rapide",
    link: '',
    git: '',
    technos: ['devicon-c-plain-wordmark colored'],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: '',
    pictures: [],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'COREWAR',
    subtitle: 'A simple war app',
    logo: '',
    pictures: [],
    description:
      "Projet dont l'object est de participer a la guerre de MARS (corewar), une guerre \
    ou deux programmes s'affrontent afin de corrompre la memoire de l'autre.",
    link: '',
    git: '',
    technos: ['devicon-c-plain-wordmark colored'],
  },
  {
    name: 'PUSH_SWAP',
    subtitle: 'A simple stack app',
    logo: '',
    pictures: [],
    description:
      "Projet dont l'objectif est de realiser un algorithme de tri. Il n'aura pour seule \
    raison remettre en ordre une 'stack' de non et pourra utiliser seulement quelques actions. Il doit \
    realiser sa tache en effectuant le moins d'action possible (complexite algorithmique)",
    link: '',
    git: '',
    technos: ['devicon-c-plain-wordmark colored'],
  },
  {
    name: 'YOUR APP',
    subtitle: 'Coming soon',
    logo: '',
    pictures: [],
    description: '',
    link: '',
    git: '',
    technos: [],
  },
  {
    name: 'AlphaBril',
    subtitle: 'Florian-Marie Doucet',
    logo: '',
    pictures: ['https://dam.malt.com/txnsh1cmtklme34ypjva?gravity=face&func=face&face_margin=60&w=440&h=440&force_format=webp'],
    description:
      "Développeur en freelance depuis 3 ans, j'accompagne mes clients en leur apportant \
    des conseils et en développant leurs plateformes complètes. Je suis capable de mener a bien \
    un projet depuis la mise en place de son architecture, jusqu'à sa sortie en production en \
    passant par son CI/CD. Je travaille depuis plus d'un an sur des projets web en React/Nodejs avec \
    des databases allant de Mysql a Mongo en passant par Neo4j et Postgres.",
    link: 'https://www.malt.fr/profile/doucetflorianmarie',
    git: 'https://github.com/AlphaBril',
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
