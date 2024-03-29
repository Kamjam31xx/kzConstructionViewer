// author : Kameron Briggs
import { OrbitControls          } from "./OrbitControls.js" ;
import { WEBGL                  } from "./WebGL.js"         ;
import { BoxGeometry, Euler, Vector3                } from "./three.module.js"  ;
import { GUI                    } from "./dat.gui.module.js";
import { OBJLoader              } from './OBJLoader.js';
//import {} from "./infiniteGridHelper.js";

let Scene, Camera, Renderer, Loader, CameraControls;
let Gui;
let grid;

const CONST = Object.freeze(
{
    GLOBAL_SCALE: 1.0,
    CONSTANT_TEST_STRING: 'This is a test string.',
    PI: 3.14159265359,
    TO_RADIANS: 3.14159265359/180
});

let Support = 
{
    webGLIsSupported: undefined,
    webGL2IsSupported: undefined,
    graphicsAPI: undefined,
};

async function CreateScanView(modelPath, texturePath)
{
    let view = {
        modelPath: modelPath,
        texturePath: texturePath,
        object3D: {},
        textureMaterial: {}
    };

    view.object3D = await LoadScanOBJ(view.modelPath);
    view.object3D.children[0].material = await new THREE.MeshBasicMaterial({map: await new THREE.TextureLoader().load(await view.texturePath)});
    Scene.add(await view.object3D);

    return view;

}

let RenderSettings = 
{
    antialias: true,
    precision: "lowp",
    powerPreference: "high-performance",
    logarithmicDepthBuffer: true,
    physicallyCorrectLights: true,
    toneMapping: THREE.Uncharted2ToneMapping,
    toneMappingExposure: 1.0
};

let LightSettings = 
{
    ambientIntensity: 0.7,
    ambientColor: 0xFFFFFF,
    directionalIntensity: 2.75,
    directionalColor: 0xFFFFFF,
    directionalPositions: { x: 500, y: 400, z: 800 },
};

let CameraState = 
{
    fov: 75,
    nearPlane: 0.1,
    farPlane: 2000.0,
    position: new Vector3( -80.0, 144.0, 110.0 ),
    rotation: new Euler( -0.9, -0.4, -0.47 ),
    startPosition: new Vector3( -80.0, 144.0, 110.0 ),
    startRotation: new Euler( -0.9, -0.4, -0.47 ),
};

let Lights =
{
    ambient: {},
    directional: [{},{},{},{}]
};

let Settings = 
{
    dynamicBufferScaling: false, // need to implement dynamicBufferScaling
    pixelScale: 1.0,

    backgroundColor: 0x787878,

    fogFar: 2000.0,
    fogNear: 1.0,
    fogColor: 0x000000,

    guiWidth: 300,
    guiUserStyle: 'none',
};

/*

Normal Map Generator
https://cpetry.github.io/NormalMap-Online/

strength    : 0.94
level       : 7.2
blur/sharp  : 0.0

format      : .jpg

*/
let Scans = [  
    {      
        name: "Micheals Driveway",
        before: { model: './scans/md_before.obj' , texture: './scans/md_before.jpg' , normal: './scans/md_before_norm.jpg' },
        during: { model: './scans/md_during.obj' , texture: './scans/md_during.jpg' , normal: './scans/md_during_norm.jpg' },
        after:  { model: './scans/md_after.obj'  , texture: './scans/md_after.jpg'  , normal: './scans/md_after_norm.jpg' },
        measurements: {},
        annotation: {},
        invertedAxis: '',
        rotation: new THREE.Euler(CONST.TO_RADIANS * -3.25, 0.0, 0.0),
        shaderMaterial: {}
    }
];

let Colors = {
    kzOrange: 0xff834f,
    kzOrangeEmissive: 0x99441f,
    kzBlue: 0x00a1c3,
    black: 0x000000,
    white: 0xffffff,
    backdrop0: 0x787878
}

let KzTheme = {
    fogColor: 0xff834f
}
let YellowTheme = {

}
let DarkTheme = {

}
let LightTheme = {

}

let LogoPlane = {};
let LogoMaterial = {};
let LogoGeometry = {};
let LogoWidth = 2.0;
let LogoHeight = 2.0;
let LogoScale = 1.0;
let LogoX = -window.innerWidth/260.0;
let LogoY = window.innerWidth/270.0;
let LogoZ = 10.0;

let Grid = {};
let GridMaterial = {};
let MeasureMaterial = {};
let CurrentScan = 0;

// GUI FOLDERS
let BaseFolder;
let BaseController;

let PresentJob;
let PresentJobIndex;
let PresentJobName;
let PresentView;
let PresentScan;
let PresentScanMaterial;
let PresentShaderMaterial;

let Theme = {};


if(IsSupported())
{
    InitializeApp();
    InitializeGui();

    window.addEventListener('resize', OnWindowResize, false);
    CameraControls = new OrbitControls(Camera, Renderer.domElement);

    OnWindowResize();

    // DO NOT REMOVE THIS CODE // IT FIXES AN UNSOLVED BUG //
    for(let i = 0; i < 300; i += 1)
    {
        let bObj = new THREE.Mesh( new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }));
        bObj.material.dispose();
        bObj.geometry.dispose();
    }
    // DO NOT REMOVE THIS CODE // IT FIXES AN UNSOLVED BUG //

    PresentJob = Scans[0];
    PresentJobIndex = 0;
    PresentJobName = Scans[0].name;
    PresentView = "before";
    PresentScan = await LoadScanOBJ(Scans[0].before.model);
    PresentScanMaterial = await new THREE.MeshBasicMaterial({map: await new THREE.TextureLoader().load(await Scans[0].before.texture)});
    PresentShaderMaterial = new THREE.MeshPhongMaterial({ 
        color: Colors.kzOrange,
        emissive: 0x3f3f3f,
        specular: 0x353535,
        shininess: 18,
        normalMap: await new THREE.TextureLoader().load(Scans[0].before.normal),
    });
    PresentShaderMaterial.normalScale.set(1.0,1.0);
    PresentScan.children[0].material = PresentScanMaterial.clone();

    console.log(PresentScanMaterial);

    Scene.add(PresentScan);


    LogoMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
    LogoGeometry = new THREE.PlaneGeometry(LogoWidth * LogoScale, LogoHeight * LogoScale);
    LogoPlane = new THREE.Mesh(LogoGeometry, LogoMaterial);
    Scene.add(LogoPlane);

    RenderLoop();
}
else
{
    console.log("app is not supported");
}


function RenderLoop()
{ 
    requestAnimationFrame(RenderLoop);

    LogoPlane.position.copy(Camera.position);
    LogoPlane.rotation.copy(Camera.rotation);

    let scaleIt = 1.0;
    let forward = new Vector3(0.0, 0.0, -LogoZ * scaleIt).applyEuler(Camera.rotation.clone());
    let up = new Vector3(0.0, LogoY, 0.0).applyEuler(Camera.rotation.clone());
    let right = new Vector3(LogoX, 0.0, 0.0).applyEuler(Camera.rotation.clone());

    AddToVec3(LogoPlane.position, forward);
    AddToVec3(LogoPlane.position, up);
    AddToVec3(LogoPlane.position, right);

    Renderer.render(Scene, Camera);
}

function AddToVec3(dest, add)
{
    dest.x += add.x;
    dest.y += add.y;
    dest.z += add.z;
}

function OnWindowResize()
{
    CameraState.position.copy(Camera.position);
    Camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    Camera.updateProjectionMatrix();
    Camera.position.copy(CameraState.position);
    Renderer.setSize(window.innerWidth, window.innerHeight);

    CameraControls.object = Camera;
    CameraControls.update();
}

async function LoadScanOBJ(meshPath)
{
    let scanOBJ = await new Promise((resolve, reject) => new OBJLoader().load(meshPath, resolve, undefined, reject));
    return scanOBJ;
}

async function SetActiveView()
{

    PresentView = BaseController.view;

    if(BaseController.appearance == 'texture')
    {
        PresentScan.children[0].material.map.dispose();
    }
    else
    {
        PresentScan.children[0].material.normalMap.dispose();
    }
    PresentScan.children[0].material.dispose();
    PresentScan.children[0].geometry.dispose();
    PresentScanMaterial.map.dispose();
    PresentScanMaterial.dispose();
    PresentShaderMaterial.normalMap.dispose();
    PresentShaderMaterial.dispose();

    Scene.remove(PresentScan);

    PresentScan = await LoadScanOBJ(PresentJob[PresentView].model);
    PresentScanMaterial = await new THREE.MeshBasicMaterial({map: await new THREE.TextureLoader().load(PresentJob[PresentView].texture)});
    PresentShaderMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff4d00,//Colors.kzOrange,
        emissive: 0xff4d00,//Colors.kzOrangeEmissive,//0x3f3f3f,
        specular: 0xff4d00,
        shininess: 18,
        normalMap: await new THREE.TextureLoader().load(PresentJob[PresentView].normal),
    });

    if(BaseController.appearance == 'texture')
    {
        PresentScan.children[0].material = PresentScanMaterial.clone();
    }
    else
    {
        PresentScan.children[0].material = PresentShaderMaterial.clone();
    }
    Scene.add(PresentScan);

}

function IsSupported()
{
    if(WEBGL.isWebGLAvailable())
    {   
        Support.webGLIsSupported = true;
        Support.webGL2IsSupported = WEBGL.isWebGL2Available();
        Support.graphicsApi = Support.webGL2IsSupported ? 'WebGL2' : 'WebGL1';
        return true;
    } else {
        Support.webGLIsSupported = false;
        Support.webGL2IsSupported = false;
        Support.graphicsApi = 'none';
        return false;
    }
}

function InitializeApp()
{
    try
    {
        Scene = new THREE.Scene();
        Renderer = new THREE.WebGLRenderer();
        Camera = new THREE.PerspectiveCamera(Settings.fov, window.innerWidth / window.innerHeight, Settings.nearPlane, Settings.farPlane);
        Scene.background = new THREE.Color(Settings.backgroundColor);
        Scene.fog = new THREE.Fog(Settings.fogColor, Settings.fogNear, Settings.fogFar);
    }
    catch(e)
    {
        console.log("ERROR : Initialization failed at initialize");
    }

    Renderer.setPixelRatio(window.devicePixelRatio);
    Renderer.setSize((window.innerWidth/Settings.pixelScale), (window.innerHeight/Settings.pixelScale));
    document.body.appendChild(Renderer.domElement);
    Renderer.domElement.style.width =  Renderer.domElement.width  * Settings.pixelScale + 'px';
    Renderer.domElement.style.height = Renderer.domElement.height * Settings.pixelScale + 'px';
    for(const[key, value] of Object.entries(RenderSettings))
    {
        Renderer[key] = value;
    }

    Camera.position.copy(CameraState.position);
    Camera.rotation.copy(CameraState.rotation);
    Camera.updateProjectionMatrix();

    Lights.ambient = new THREE.AmbientLight(LightSettings.ambientColor, LightSettings.ambientIntensity);
    Scene.add(Lights.ambient);
    Lights.dir = new THREE.DirectionalLight(0xffffff, 1.025);
    Scene.add(Lights.dir);
    Lights.dir.position.set(200, 400, 200);
}
    
function InitializeGui()
{
    Gui = new GUI();

    Gui.width = Settings.guiWidth;
    Gui.domElement.style.userSelect = Settings.guiUserStyle;

    BaseController = 
    {
        job: 'driveway expansion',
        view: 'before',
        appearance: 'texture',
        theme: 'kz',
        toggleAppearanceButtonClicked()
        {
            if(this.appearance == 'texture') 
            {
                this.swapToShaderMaterial();
                this.appearance = 'shader';
            } else {
                this.swapToTextureMaterial();
                this.appearance = 'texture';

            }
        },
        resetCameraButtonClicked()
        {
            Camera.position.copy(CameraState.startPosition);
            Camera.rotation.copy(CameraState.startRotation);
        },
        swapToTextureMaterial()
        {
            PresentScan.children[0].material.normalMap.dispose();
            PresentScan.children[0].material.dispose();
            PresentScan.children[0].material = PresentScanMaterial.clone();
        },
        swapToShaderMaterial()
        {
            PresentScan.children[0].material.map.dispose();
            PresentScan.children[0].material.dispose();
            PresentScan.children[0].material = PresentShaderMaterial.clone();
        }
    };

    BaseFolder = Gui.addFolder("Settings");

    BaseFolder.add(BaseController, "toggleAppearanceButtonClicked").name("Toggle Appearance").onChange( function(){} );
    BaseFolder.add(BaseController, "resetCameraButtonClicked").name("Reset Camera").onChange( function()
    {
        // update things effected by toggle appearance
    });
    BaseFolder.add(BaseController, "view", ['before', 'during', 'after']).name("View").onChange( function()
    {
        SetActiveView();
    }); 
    BaseFolder.add(BaseController, "theme", ['kz', 'yellow', 'dark', 'light']).name("Theme").onChange( function()
    {
        switch(BaseController.category) 
        {
            case 'kz':
                // code for A
                break;
            case 'yellow':
                // code for D
                break;
            case 'dark':
                // code
                break;
            case 'light':
                // code
                break;
            default:
                // incase no matches
        }
    });  
    BaseFolder.open();
}



function CopyPropertiesTo(dest, source, keys)
{
    for(const[key, value] of Object.entries(source))
    {
        dest[key] = value;
    }
}

function GetScanTextureMaterial(ref)
{
    ref.object3D.children[0].material = ref.textureMaterial;
}
function GetScanShaderMaterial(ref)
{
    ref.object3D.children[0].material = ref.shaderMaterial;
}
function SetDetailModelVisibility(selection, visibility)
{
    for(let model in Scans[CurrentScan].detailModels)
    {
        if(selection == model.category)
        {
            model.object3D.visible = visibility;
        }
    }
}
function ShowAllActiveDetailModels()
{
    let active = GetActiveDetailModels();

    for(let model in Scans[CurrentScan].detailModels)
    {
        if(active.includes(model.category))
        {
            model.object3D.visible = true;
        }
    }
}
function HideAllDetailModels()
{
   for(let model in Scans[CurrentScan].detailModels)
   {
       model.object3D.visible = false;
   }
}
function GetActiveDetailModels()
{
    // wait to implement
    let active = [];
    
    if(BaseController.showMeasurements)
    {
        active.push('measurement');
    }

    return active;
}





function InvertModelAxisByString(model, string)
{
    let stringCpy = string.toLowerCase();
    let axis = {
        x: stringCpy.includes('x') ? -1 : 1,
        y: stringCpy.includes('y') ? -1 : 1,
        z: stringCpy.includes('z') ? -1 : 1,
    }
    model.applyMatrix4(new THREE.Matrix4().makeScale(axis.x, axis.y, axis.z));
}




async function LoadScans()
{
    for(let scan of Scans)
    {
        scan.before.object3D = await LoadScanOBJ(scan.before.modelPath);
        scan.before.object3D.children[0].material = await new THREE.MeshBasicMaterial({map: await new THREE.TextureLoader().load(await scan.before.texturePath)});
        Scene.add(await scan.before.object3D);

        scan.after.object3D = await LoadScanOBJ(scan.after.modelPath);
        scan.after.object3D.children[0].material = await new THREE.MeshBasicMaterial({map: await new THREE.TextureLoader().load(await scan.after.texturePath)});
        Scene.add(await scan.after.object3D);
    }
}