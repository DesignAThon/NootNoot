import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

var scene, camera, renderer, loader, textureLoader;
var penguin, friend, hat, background, sleigh, logs = [], count = 2;
let initGame = false, isAtHome = false;

scene = new THREE.Scene();
scene.background = new THREE.Color("black");
const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

function init() {
    const container = document.createElement("div");
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.25, 20);
    // x, y, z: closeness to the object
    camera.position.set(0, 0, 1);

    //Load background texture
    textureLoader = new THREE.TextureLoader();
    scene.background = textureLoader.load("../images/winterbackground.jpg");

    new RGBELoader()
        .setPath("./textures/equirectangular/")
        .load("snowy_forest_path_01_2k.hdr", function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;

            //scene.background = texture;
            scene.environment = texture;

            // model
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath("../jsm/libs/draco/");

            loader = new GLTFLoader().setPath("../models/");
            loader.setDRACOLoader(dracoLoader);

            // then you can load your glb file
            loader.load("igloo.glb", function (gltf) {
                background = gltf.scene;
                background.scale.set(0.75, 0.75, 0.75);
                background.position.set(0.3, 0.1, 0);
                scene.add(background);
            }, undefined, function (error) {
                console.error(error);
            });

            loader.load("Penguin.gltf", function (gltf) {
                penguin = gltf.scene;
                penguin.scale.set(0.025, 0.025, 0.025);
                penguin.position.set(-0.5, -0.04, 0);
                scene.add(penguin);
                camera.lookAt(0, 0, 0);
            }, undefined, function (error) {
                console.error(error);
            });

            loader.load("sleigh.glb", function (gltf) {
                sleigh = gltf.scene;
                sleigh.scale.set(0.25, 0.25, 0.25);
                sleigh.position.x = penguin.position.x - 0.1;
                sleigh.lookAt(0, 0, -Math.PI);
                scene.add(sleigh);
            }, undefined, function (error) {
                console.error(error);
            });

            for(let i = 0; i <= count; i++){
                loader.load("log6.gltf", function (gltf) {
                    logs[i] = gltf.scene;
                    logs[i].scale.set(0.1, 0.1, 0.1);
                    logs[i].position.set(sleigh.position);
                    //logs[count].lookAt(-Math.PI/2, 0,0);
                    logs[i].position.y = sleigh.position.y + 0.02*i;
                    logs[i].position.z = sleigh.position.z - 0.05;
                    logs[i].position.x = sleigh.position.x + 0.015;
                    scene.add(logs[i]);
                    render();
                });
            }
        });

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    window.addEventListener("resize", onWindowResize);
}

function render() {
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

init();
render();
document.addEventListener("keydown", function (event) {
    const key = event.key.toLowerCase(); // "a", "1", "Shift", etc.
    if (!initGame) {
        initGame = true;
        document.getElementById("start").style.display = "none";
    }

    if(!isAtHome && key == "d") { //forward
            if (penguin.position.x + 0.2 < 0.30) { 
                penguin.position.x += 0.03;
                penguin.lookAt(0, 0, Math.PI);
                sleigh.lookAt(0, 0, -Math.PI);
                sleigh.position.x = penguin.position.x - 0.1; //move sleigh with penguin
                if (logs.length > 0) logs.forEach(log => log.position.x = sleigh.position.x + 0.015);
                
            }
            else { // transition because penguin is home
                isAtHome = true;
                scene.background = textureLoader.load("../images/icewall.jpg");
                background.removeFromParent();
                sleigh.removeFromParent();
                //penguin.lookAt(-Math.PI/2,0,0);
                penguin.position.set(-0.3, -0.3,0)
                penguin.scale.set(0.1, 0.1, 0.1);
                logs.forEach(log => log.removeFromParent());
            }
            render();
    }

    if(isAtHome) {
        render();
        document.getElementById("caption").style.display = "block";
        loader.load("friend.glb", function (gltf) {
            friend = gltf.scene;
            friend.scale.set(0.10, 0.10, 0.10);
            friend.position.set(0.35, -0.3, 0);
            scene.add(friend);
            friend.lookAt(0, 0, -Math.PI);

            loader.load("fishcooking.glb", function (gltf) {
                let fire = gltf.scene;
                fire.scale.set(0.35, 0.35, 0.35);
                fire.position.set(0.05, -0.21, 0);
                scene.add(fire);

            })
        }, undefined, function (error) {
            console.error(error);
        });
    }

    render();
});

render();
