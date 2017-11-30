const maxObstaces = 5;
const maxLights = 16;
var mousePosition = new THREE.Vector2(0,0);
var difficulty = 1.0;
var defaultSpeed = 0.05;
var numberOfCollisions = 0;
const tubeDiameter = 5.0;
const lightsSpacing = 20.0;

document.addEventListener( 'mousemove', onDocumentMouseMove, false );

var tubes = [];
var obstacles = [];
var lights = [];

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();

var player = GeometryGenerators.cube();
var pointLight = null;

var lightsBlinkingTween = null;
var tubeLightsColor = new THREE.Color(1, 1, 1);

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var modelProvider = new ModelProvider();

var isRunning = false;

function animate() {

    updatePositions();
    updateRotations();

    checkCollision();

    regenerateLights();
    regenerateObstacles();
    updateCameraPosition();

    TWEEN.update();

    requestAnimationFrame( animate );

    renderer.render( scene, camera );
    difficulty += 0.01;
}

function checkCollision() {
    if (isRunning) {
        let caster = new THREE.Raycaster();
        let ray = new THREE.Vector3(0, 0, -(defaultSpeed * difficulty));
        let maxDistance = 1;

        caster.set(player.position, ray);
        let collisions = caster.intersectObjects(obstacles);

        if (collisions.length > 0 && collisions[0].distance <= maxDistance) {

            updatePositions();
            isRunning = false;
            console.log("Collision");

            blinkLightsRed(5, function () {
                reset();
            });
        }
    }
}

function reset() {

    difficulty = 1.0;
    obstacles.forEach(function(object) {
        scene.remove(object);
    })
    obstacles = [];

    isRunning = true;
}

function updatePositions() {

    if (isRunning) {

        obstacles.forEach(function (object) {
            object.position.z += defaultSpeed * difficulty;
        });

        lights.forEach(function (object) {
            object.position.z += defaultSpeed * difficulty;
        });
    }
}

function updateRotations() {

    obstacles.forEach( function(object) {
        object.rotation.y += 0.05;
    });
}

function updateCameraPosition() {

    let bugfixmodifier = 0.6;

    camera.position.x = mousePosition.x * tubeDiameter * bugfixmodifier;
    camera.position.y = mousePosition.y * tubeDiameter * bugfixmodifier;
    player.position.x = mousePosition.x * tubeDiameter * bugfixmodifier;
    player.position.y = mousePosition.y * tubeDiameter * bugfixmodifier;
    pointLight.position.x = mousePosition.x * tubeDiameter * bugfixmodifier;
    pointLight.position.y = mousePosition.y * tubeDiameter * bugfixmodifier;
    pointLight.target.position.set(pointLight.position.x, pointLight.position.y, -1);
}

function regenerateObstacles() {

    // obstacles.forEach( function(object, index, array) {
    //     if (object.position.z > 0) {
    //         array.splice(index, 1);
    //         scene.remove(object);
    //     }
    // });
    clearObjectsBehindPlayer(obstacles, 0);

    let obstaclesToGenerate = maxObstaces - obstacles.length;

    for (i = 0; i < obstaclesToGenerate; i++) {

        // Code used to generate random cubes as obstacles instead of models.

        // let cube = GeometryGenerators.cube();
        // cube.position.z = GeometryGenerators.randomFloat(-20, -100);
        // cube.position.x = GeometryGenerators.randomFloat(-4, 4);
        // cube.position.y = GeometryGenerators.randomFloat(-4, 4);
        // obstacles.push(cube);
        // scene.add(cube);

        let obstacle = modelProvider.easyObstacle();

        let furthestObject = obstacles.reduce(function(prev, current) {
            return (prev.position.z < current.position.z) ? prev : current
        }, modelProvider.easyObstacle()); // Uses default value of default generated obstacle, if none found.

        obstacle.position.z = GeometryGenerators.randomFloat(furthestObject.position.z, furthestObject.position.z - 200);
        obstacle.rotation.y = GeometryGenerators.randomFloat(0, Math.PI);

        obstacles.push(obstacle);
        scene.add(obstacle);
    }
}

const empty = new THREE.Object3D();

function regenerateLights() {

    clearObjectsBehindPlayer(lights, lightsSpacing * 5);

    let furthestObject = lights.reduce(function(prev, current) {
        return (prev.position.z < current.position.z) ? prev : current
    }, empty);

    let furthestDistance = furthestObject.position.z; //furthestObject != null ? furthestObject.position.z : -lightsSpacing;

    let lightsToGenerate = maxLights - lights.length;
    let sphere = new THREE.SphereGeometry( 0.3, 8, 6 );
    let diameterletoff = 0.3;
    for (i = 0; i < lightsToGenerate / 4; i++) {

        let light1 = new THREE.PointLight( tubeLightsColor, 0.6, 30 );
        light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: tubeLightsColor } ) ) );
        light1.position.x = Math.cos(90) * (tubeDiameter- diameterletoff);
        light1.position.y = Math.sin(90) * (tubeDiameter- diameterletoff);
        light1.position.z = furthestDistance - lightsSpacing;
        lights.push(light1);
        scene.add(light1);
    }
}

function clearObjectsBehindPlayer(array, tolerance) {

    array.forEach( function(object, index, array) {
        if (object.position.z > tolerance) {
            array.splice(index, 1);
            scene.remove(object);
        }
    });
}

function setLightsColor(color) {
    lights.forEach( function(light) {
        light.color.set(color);
        light.children[0].material = new THREE.MeshBasicMaterial( { color: color } );
    });
    tubeLightsColor = color;
}

function blinkLightsRed(times, onFinished) {
    var colorValues = {r: 1.0, b: 1.0, g: 1.0 };
    lightsBlinkingTween = new TWEEN.Tween(colorValues)
        .to({r: 1.0, b: 0.0, g: 0.0 }, 500)
        .easing(TWEEN.Easing.Quartic.InOut)
        .onUpdate( function() {
            tubeLightsColor.r = colorValues.r;
            tubeLightsColor.g = colorValues.g;
            tubeLightsColor.b = colorValues.b;
            setLightsColor(tubeLightsColor);
        })
        .yoyo(true).repeat(times)
        .start()
        .onComplete(function() {
            tubeLightsColor.r = 1.0;
            tubeLightsColor.b = 1.0;
            tubeLightsColor.g = 1.0;
            setLightsColor(tubeLightsColor);
            onFinished()
        });
}

function setupScene(){

    camera.position.z = 0;

    let light = new THREE.AmbientLight( 0xffffff );
    // scene.add(light);

    // var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
    // directionalLight.position.x = -0.5;
    // directionalLight.position.y = 0;
    // directionalLight.position.z = 0;
    // scene.add(directionalLight);

    pointLight = new THREE.SpotLight( 0xffffff, 1, 200, 0.5, 0.5, 1 );
    pointLight.position.set( 0, 0, 0 );
    pointLight.target.position.set(0, 0, -1);
    scene.add(pointLight);
    scene.add(pointLight.target);

    // obstacles.push(GeometryGenerators.cube());

    let tube = GeometryGenerators.straightTube(tubeDiameter, 500);
    tubes.push(tube);

    tubes.forEach(function(tube) {
        tube.position.z = -500;
        scene.add(tube);
    });

    modelProvider.loadModels( function(){
        regenerateObstacles();
        regenerateLights();
        isRunning = true;
        animate();
    });
}

function onDocumentMouseMove( event ) {
    mousePosition.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mousePosition.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

setupScene();