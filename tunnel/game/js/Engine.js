var maxObstaces = 5;
var mousePosition = new THREE.Vector2(0,0);
var difficulty = 1.0;
var defaultSpeed = 0.05;
var numberOfCollisions = 0;

document.addEventListener( 'mousemove', onDocumentMouseMove, false );

var tubes = [];
var obstacles = [];

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();

var player = GeometryGenerators.cube();
var pointLight = null;

// renderer.setFaceCulling(THREE.CullFaceNone, THREE.FrontFaceDirectionCCW);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var modelProvider = new ModelProvider();

function animate() {

    updatePositions();
    updateRotations();

    checkCollision();

    regenerateObstacles();
    updateCameraPosition();

    requestAnimationFrame( animate );

    renderer.render( scene, camera );
    difficulty += 0.01;
}

function checkCollision() {

    let caster = new THREE.Raycaster();
    let ray = new THREE.Vector3(0,0,-(defaultSpeed*difficulty));
    let maxDistance = 1;

    // obstacles.forEach(function(object) {
    //
    // });


    caster.set(player.position, ray);
    let collisions = caster.intersectObjects(obstacles);
    // And disable that direction if we do
    if (collisions.length > 0 && collisions[0].distance <= maxDistance) {

        console.log("Collision");
        reset();

    }
}

function reset() {

    difficulty = 1.0;
    obstacles.forEach(function(object) {
        scene.remove(object);
    })
    obstacles = [];
}

function updatePositions() {

    obstacles.forEach( function(object) {
        object.position.z += defaultSpeed * difficulty;
    });
}

function updateRotations() {

    obstacles.forEach( function(object) {
        object.rotation.y += 0.05;
        // object.rotation.x += 0.05;
    });
}

function updateCameraPosition() {

    camera.position.x = mousePosition.x * 5;
    camera.position.y = mousePosition.y * 5;
    player.position.x = mousePosition.x * 5;
    player.position.y = mousePosition.y * 5;
    pointLight.position.x = mousePosition.x * 5;
    pointLight.position.y = mousePosition.y * 5;
}

function regenerateObstacles() {

    obstacles.forEach( function(object, index, array) {
        if (object.position.z > 0) {
            array.splice(index, 1);
            scene.remove(object);
        }
    });

    let obstaclesToGenerate = maxObstaces - obstacles.length;

    for (i = 0; i < obstaclesToGenerate; i++) {
        // let cube = GeometryGenerators.cube();
        // cube.position.z = GeometryGenerators.randomFloat(-20, -100);
        // cube.position.x = GeometryGenerators.randomFloat(-4, 4);
        // cube.position.y = GeometryGenerators.randomFloat(-4, 4);
        // obstacles.push(cube);
        // scene.add(cube);
        let obstacle = modelProvider.easyObstacle();
        obstacle.position.z = GeometryGenerators.randomFloat(-5, -500);
        obstacle.rotation.y = GeometryGenerators.randomFloat(0, Math.PI);
        obstacles.push(obstacle);
        scene.add(obstacle);
    }
}

function setupScene(){

    camera.position.z = 0;

    let light = new THREE.AmbientLight( 0xffffff );
    scene.add(light);

    // var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
    // directionalLight.position.x = -0.5;
    // directionalLight.position.y = 0;
    // directionalLight.position.z = 0;
    // scene.add(directionalLight);

    pointLight = new THREE.PointLight( 0xffffff, 0.2 );
    scene.add( pointLight );

    // let spotLight = new THREE.PointLight( 0xffffff, 0.1, 100, 1 );
    // spotLight.position.set( 0, 0, -10 );
    // scene.add(spotLight);

    // obstacles.push(GeometryGenerators.cube());

    let tube = GeometryGenerators.straightTube(5, 500);
    tubes.push(tube);

    tubes.forEach(function(tube) {
        tube.position.z = -500;
        scene.add(tube);
    });

    modelProvider.loadModels( function(){
        regenerateObstacles();
        animate();
    });

    // obstacles.forEach(function(cube) {
    //     cube.position.z = -10;
    //     scene.add(cube);
    // });
}

function onDocumentMouseMove( event ) {
    mousePosition.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mousePosition.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

setupScene();

// animate();