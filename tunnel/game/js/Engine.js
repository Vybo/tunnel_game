const maxObstaces = 5;
const maxLights = 16;
var mousePosition = new THREE.Vector2(0,0);
var difficulty = 1.0;
var defaultSpeed = 0.05;
var numberOfCollisions = 0;
const tubeDiameter = 5.0;
const lightsSpacing = 20.0;
var firstPerson = false;
var cameraMovementMultiplier = 1.0;
var tick = 0;

var shieldPower = 100;
var brake = 100;
var distance = 0;
var speed = 0;

document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener( 'mousedown', onMouseDown );
document.addEventListener( 'mouseup', onMouseUp );

var tubes = [];
var obstacles = [];
var lights = [];
var obstacleRotationMultipliers = [];

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
var clock = new THREE.Clock();
var composer = null;

var glitchPass = null;

var player = null;
var pointLight = null;
var shield = null;

var lightsBlinkingTween = null;
var tubeLightsColor = new THREE.Color(1, 1, 1);

var particleSystem1 = null;
var particleSystem1Options = null;
var particleSystem1SpawnerOptions = null;

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var environmentProvider = new EnvironmentProvider();

var isRunning = false;

var interface = new Interface();
var storage = new Storage();

var shieldActive = false;

function animate() {

    requestAnimationFrame( animate );

    updatePositions();
    updateRotations();

    checkCollision();

    regenerateLights();
    regenerateObstacles();
    updateCameraPosition();

    adjustDifficulty();

    TWEEN.update();

    if (composer) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }

    updateInterfaceValues();
}

function adjustDifficulty() {
    difficulty += 0.01;
    if (isRunning) particleSystem1Options.velocity.z = (difficulty - 1.0) * 0.5;

    tubeLightsColor.b = tubeLightsColor.b > 0 ? tubeLightsColor.b - 0.0001 : 0;
    tubeLightsColor.g = tubeLightsColor.g > 0 ? tubeLightsColor.g - 0.0001 : 0;
}

function checkCollision() {
    if (isRunning && !shieldActive) {
        let caster = new THREE.Raycaster();
        let ray = new THREE.Vector3(0, 0, -(defaultSpeed * difficulty));
        let maxDistance = 1;

        caster.set(player.position, ray);
        let collisions = caster.intersectObjects(obstacles);

        if (collisions.length > 0 && collisions[0].distance <= maxDistance) {

            // isRunning = false;
            setRunning(false);
            particleSystem1Options.velocity.z = 0.01;

            console.log("Collision");
            setScreenGlitch(true);
            blinkLightsRed(5, function () {
                // reset();
                setScreenGlitch(false);
            });
        }
    }
}

function updateHighscore(score) {
    storage.setHighscore(score);
}

function reset() {
    setScreenGlitch(false);
    difficulty = 1.0;
    particleSystem1Options.velocity.z = 1;

    obstacles.forEach(function(object) {
        scene.remove(object);
    });

    obstacles = [];
    tubeLightsColor.b = 1;
    tubeLightsColor.g = 1;

    distance = 0;
    // isRunning = true;
    setRunning(true);
}

function updatePositions() {

    if (isRunning) {

        obstacles.forEach(function (object) {
            object.position.z += defaultSpeed * difficulty;
        });

        lights.forEach(function (object) {
            object.position.z += defaultSpeed * difficulty;
        });

        speed = 0.277778 * defaultSpeed * difficulty * 100;
        distance += 0.277778 * defaultSpeed * difficulty;

        if (shieldActive) {
            shieldPower -= 0.1;

            if (shieldPower < 0) {
                setShieldActive(false);
            }
        }
    }
}

function updateRotations() {

    obstacles.forEach( function(object) {
        object.rotation.y += object.rotationCoefficient + (difficulty / 1000);
    });

    if (shieldActive) {
        shield.material.alphaMap.offset.y = tick;
    }
}

const bugfixmodifier = 0.6;

function updateCameraPosition() { // Refactor to updatePlayer

    if (isRunning) {
        camera.position.x = mousePosition.x * tubeDiameter * bugfixmodifier * cameraMovementMultiplier;
        camera.position.y = mousePosition.y * tubeDiameter * bugfixmodifier * cameraMovementMultiplier;
        player.position.x = mousePosition.x * tubeDiameter * bugfixmodifier;
        player.position.y = mousePosition.y * tubeDiameter * bugfixmodifier;
        pointLight.position.x = mousePosition.x * tubeDiameter * bugfixmodifier;
        pointLight.position.y = mousePosition.y * tubeDiameter * bugfixmodifier;
        pointLight.target.position.set(pointLight.position.x, pointLight.position.y, -1);

        shield.position.x = player.position.x;
        shield.position.y = player.position.y;

        if (particleSystem1) {
            let delta = clock.getDelta() * particleSystem1SpawnerOptions.timeScale;
            tick += delta;

            if (tick < 0) tick = 0;

            if (delta > 0) {
                let positionForShip = Helpers.particlePositionForShip("ship1", player.position);

                particleSystem1Options.position.x = positionForShip.x;
                particleSystem1Options.position.y = positionForShip.y;
                particleSystem1Options.position.z = positionForShip.z;

                for (var x = 0; x < particleSystem1SpawnerOptions.spawnRate * delta; x++) {
                    particleSystem1.spawnParticle(particleSystem1Options);
                }
            }
        }
    }

    particleSystem1.update(tick);
}

function updateInterfaceValues() {
    interface.updateDistance(distance);
    interface.updateSpeed(speed);
    interface.updateShield(shieldPower);
}

function updateMenuValues() {
    interface.updateHighscore(storage.getHighscore());
    interface.updateCurrentScore(distance);
}

function setShieldActive(active) {
    shieldActive = active;

    if (active) {
        shield.visible = true;
        expandShield( function() {} );
    } else {
        retractShield( function () { shield.visible = false; })
    }

}

function regenerateObstacles() {

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

        let obstacle = environmentProvider.easyObstacle();

        let furthestObject = obstacles.reduce(function(prev, current) {
            return (prev.position.z < current.position.z) ? prev : current
        }, environmentProvider.easyObstacle()); // Uses default value of default generated obstacle, if none found.

        obstacle.position.z = GeometryGenerators.randomFloat(furthestObject.position.z - 20, furthestObject.position.z - 200);
        obstacle.rotation.y = GeometryGenerators.randomFloat(0, Math.PI);
        obstacle.rotationCoefficient = GeometryGenerators.randomFloat(-0.07, 0.07);
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
    for (i = 0; i <= lightsToGenerate; i++) {

        let light1 = new THREE.PointLight( tubeLightsColor, 0.3, 30 );
        light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: tubeLightsColor } ) ) );
        light1.position.x = Math.cos(90) * (tubeDiameter- diameterletoff);
        light1.position.y = Math.sin(90) * (tubeDiameter- diameterletoff);
        light1.position.z = furthestDistance - lightsSpacing;
        furthestDistance += lightsSpacing;
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

function setScreenGlitch(glitched) {

    if (!composer) return;

    if (glitched) {
        glitchPass.shouldGlitch = true;
    } else {
        glitchPass.shouldGlitch = false;
    }
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

            onFinished();
        });
}

function expandShield(onFinished) {
    var scale = new THREE.Vector3(0.1, 0.1, 0.1);

    let scaleTween = new TWEEN.Tween(scale)
        .to(new THREE.Vector3(1, 1, 1), 500)
        .easing(TWEEN.Easing.Quartic.InOut)
        .onUpdate( function() {
            shield.scale.x = scale.x;
            shield.scale.y = scale.y;
            shield.scale.z = scale.z;
        })
        .start()
        .onComplete(function() {
            shield.scale = new THREE.Vector3(1, 1, 1);

            onFinished();
        });
}

function retractShield(onFinished) {
    var scale = new THREE.Vector3(1, 1, 1);

    let scaleTween = new TWEEN.Tween(scale)
        .to(new THREE.Vector3(0.1, 0.1, 0.1), 500)
        .easing(TWEEN.Easing.Quartic.InOut)
        .onUpdate( function() {
            shield.scale.x = scale.x;
            shield.scale.y = scale.y;
            shield.scale.z = scale.z;
        })
        .start()
        .onComplete(function() {
            shield.scale = new THREE.Vector3(0.1, 0.1, 0.1);

            onFinished()
        });
}

function setupPlayer() {

    if (firstPerson) {
        player = GeometryGenerators.cube()
        camera.position.z = 0;

    } else {

        player = environmentProvider.ship();
        scene.add(player);

        particleSystem1 = new THREE.GPUParticleSystem( {
            maxParticles: 250000
        } );

        particleSystem1Options = {
            position: new THREE.Vector3(),
            positionRandomness: 0.05,
            velocity: new THREE.Vector3(0, 0, 0.5),
            velocityRandomness: .5,
            color: 0xff6600,
            colorRandomness: 1.0,
            turbulence: .0,
            lifetime: 1,
            size: 10,
            sizeRandomness: 1
        };

        particleSystem1SpawnerOptions = {
            spawnRate: 20000,
            horizontalSpeed: 1.5,
            verticalSpeed: 1.33,
            timeScale: .5
        };

        scene.add(particleSystem1);

        camera.position.z = 1.5;
        cameraMovementMultiplier = 0.7;

        shield = environmentProvider.shield();
        scene.add(shield);
        setShieldActive(false);
    }
}

function setRunning(running) {

    if (running) {
        isRunning = true;
        interface.setIndicatorsVisibility(true);
        interface.setMenuVisibility(false);
    } else {
        isRunning = false;
        interface.setIndicatorsVisibility(false);
        interface.setMenuVisibility(true);

        if (distance > storage.getHighscore()) {
            storage.setHighscore(distance);
        }

        updateMenuValues();
    }
}

function setupScene(){
    interface.setLoadingVisibility(true);
    interface.setIndicatorsVisibility(false);
    interface.setMenuVisibility(false);

    let light = new THREE.AmbientLight( 0x555555 );
    scene.add(light);

    pointLight = new THREE.SpotLight( 0xffffff, 1, 200, 0.5, 0.5, 1 );
    pointLight.position.set( 0, 0, 0 );
    pointLight.target.position.set(0, 0, -1);
    scene.add(pointLight);
    scene.add(pointLight.target);

    let tube = GeometryGenerators.straightTube(tubeDiameter, 500);
    tubes.push(tube);

    tubes.forEach(function(tube) {
        tube.position.z = -500;
        scene.add(tube);
    });

    environmentProvider.loadModels( function(){
        setupPlayer();
        //isRunning = true;
        animate();

        interface.startButtonOnClickHandler(function() {
            reset();
        });

        updateMenuValues();

        interface.setLoadingVisibility(false);
        interface.setIndicatorsVisibility(false);
        interface.setMenuVisibility(true);
    });
}

function onDocumentMouseMove( event ) {
    mousePosition.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mousePosition.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onMouseDown ( e ) {
    if (e.which === 1) {
        if (isRunning) {
            setShieldActive(true);
        }
    } else if (e.which === 3) {
        /*Right Mouse*/
    }
}

function onMouseUp ( e ) {
    if (e.which === 1) {
        if (isRunning) {
            setShieldActive(false);
        }
    } else if (e.which === 3) {
        /*Right Mouse*/
    }
}

function setupPosprocessing(){
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    glitchPass = new THREE.GlitchPass();
    glitchPass.renderToScreen = true;
    glitchPass.shouldGlitch = false;
    composer.addPass(glitchPass);
}

setupPosprocessing();
setupScene();
