const maxObstaces = 5;
const maxLights = 16;
var mousePosition = new THREE.Vector2(0,0);
var difficulty = 1.0;
var defaultSpeed = 0.05;
const tubeDiameter = 5.0;
const lightsSpacing = 20.0;
var firstPerson = false;
var cameraMovementMultiplier = 1.0;
var tick = 0;

var shieldPower = 10;
var brakePower = 0;
var distance = 0;
var speed = 0;

document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener( 'mousedown', onMouseDown );
document.addEventListener( 'mouseup', onMouseUp );
// Prevents context menu from popping up, right mouse button is used for game.
document.addEventListener('contextmenu', event => event.preventDefault());
window.addEventListener( 'resize', onWindowResize, false );

var tubes = [];
var mainTube = null;
var obstacles = [];
var lights = [];

var bonuses = {
    shields: [],
    stars: [],
    arrows:[]
};

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

var cameraAudioListener = null;

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var environmentProvider = new EnvironmentProvider();

var isRunning = false;

var interface = new Interface();
var storage = new Storage();

var shieldActive = false;
var brakeActive = false;

var impactSound = null;
var engineSound = null;
var gameMusic = null;

function animate() {

    requestAnimationFrame( animate );

    updatePositions();
    updateRotations();

    checkCollision();

    regenerateLights();
    regenerateObstacles();
    regenerateBonuses();
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

    if (brakeActive) {

        difficulty -= 0.05;
        if (isRunning) particleSystem1Options.velocity.z = (difficulty - 1.0) * 0.5 * -1;

        tubeLightsColor.b = tubeLightsColor.b > 0 ? tubeLightsColor.b + 0.0001 : 0;
        tubeLightsColor.g = tubeLightsColor.g > 0 ? tubeLightsColor.g + 0.0001 : 0;

        adjustAudioPlaybackSpeed(difficulty / 10);

    } else {

        difficulty += 0.01;
        if (isRunning) particleSystem1Options.velocity.z = (difficulty - 1.0) * 0.5;

        tubeLightsColor.b = tubeLightsColor.b > 0 ? tubeLightsColor.b - 0.0001 : 0;
        tubeLightsColor.g = tubeLightsColor.g > 0 ? tubeLightsColor.g - 0.0001 : 0;

        adjustAudioPlaybackSpeed(difficulty / 10);
    }
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
            impactSound.play();
            setScreenGlitch(true);
            blinkLightsRed(5, function () {
                // reset();
                setScreenGlitch(false);
            });
        }
    }

    if (isRunning) {

        let caster = new THREE.Raycaster();
        let ray = new THREE.Vector3(0, 0, -(defaultSpeed * difficulty));
        let maxDistance = 0.0;

        caster.set(player.position, ray);
        let arrowsCollisions = caster.intersectObjects(bonuses.arrows, true);

        if (arrowsCollisions.length > 0 && arrowsCollisions[0].distance <= maxDistance) {

            brakePower = brakePower + 40 > 100 ? 100 : brakePower + 40;

            removeMeshFromSceneAndArray(arrowsCollisions[0], bonuses.arrows);
            blinkLightsRed(1, function () {});

            console.log("Picked up arrow.");
            interface.flashMessage("Picked up bonus", "Brake power!");

            if (arrowsCollisions[0].object.parent.children.length > 0) {
                let audio = arrowsCollisions[0].object.parent.children[arrowsCollisions[0].object.parent.children.length - 1];
                audio.play();
            }

            return;
        }

        let shieldsCollisions = caster.intersectObjects(bonuses.shields, true);

        if (shieldsCollisions.length > 0 && shieldsCollisions[0].distance <= maxDistance) {

            shieldPower = shieldPower + 20 > 100 ? 100 : shieldPower + 20;

            removeMeshFromSceneAndArray(shieldsCollisions[0], bonuses.shields);
            blinkLightsBlue(1, function () {});

            console.log("Picked up shield.");
            interface.flashMessage("Picked up bonus", "Shield power!");

            if (shieldsCollisions[0].object.parent.children.length > 0) {
                let audio = shieldsCollisions[0].object.parent.children[shieldsCollisions[0].object.parent.children.length - 1];
                audio.play();
            }

            return;
        }

        let starsCollisions = caster.intersectObjects(bonuses.stars, true);

        if (starsCollisions.length > 0 && starsCollisions[0].distance <= maxDistance) {

            distance += 400;

            removeMeshFromSceneAndArray(starsCollisions[0], bonuses.stars);
            blinkLightsGreen(1, function () {});

            console.log("Picked up coin.");
            interface.flashMessage("Picked up bonus", "400 points!");

            if (starsCollisions[0].object.parent.children.length > 0) {
                let audio = starsCollisions[0].object.parent.children[starsCollisions[0].object.parent.children.length - 1];
                audio.play();
            }

            return;
        }
    }
}

function removeMeshFromSceneAndArray(objectToRemove, array) {

    array.forEach( function(object, index, array) {
        if (objectToRemove.id == object.id || objectToRemove.object.parent.id == object.id) {

            array.splice(index, 1);
            scene.remove(object);
        }
    });
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
    brakePower = 10;
    shieldPower = 50;
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

        bonuses.shields.forEach(function (object) {
            object.position.z += defaultSpeed * difficulty;
        });

        bonuses.arrows.forEach(function (object) {
            object.position.z += defaultSpeed * difficulty;
        });

        bonuses.stars.forEach(function (object) {
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

        if (brakeActive) {
            brakePower -= 0.5;

            if (brakePower < 0) {
                setBrakeActive(false);
            }
        }

        mainTube.material.map.offset.x -= (defaultSpeed * difficulty) / 20;
    }
}

function updateRotations() {

    obstacles.forEach( function(object) {
        object.rotation.y += object.rotationCoefficient + (difficulty / 1000);
    });

    bonuses.shields.forEach( function(object) {
        object.rotation.y += 0.1;
    });

    bonuses.stars.forEach( function(object) {
        object.rotation.y += 0.1;
    });

    bonuses.arrows.forEach( function(object) {
        object.rotation.y += 0.1;
    });

    if (shieldActive) {
        shield.material.alphaMap.offset.y = tick;
    }
}

const bugfixmodifier = 0.7;

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
    interface.updateBrake(brakePower);
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

function setBrakeActive(active) {
    brakeActive = active;
}

function regenerateObstacles() {

    clearObjectsBehindPlayer(obstacles, 0, true);

    let obstaclesToGenerate = maxObstaces - obstacles.length;

    for (i = 0; i < obstaclesToGenerate; i++) {

        let obstacle = environmentProvider.easyObstacle();

        let furthestObject = obstacles.reduce(function(prev, current) {
            return (prev.position.z < current.position.z) ? prev : current
        }, environmentProvider.easyObstacle()); // Uses default value of default generated obstacle, if none found.

        obstacle.position.z = GeometryGenerators.randomFloat(furthestObject.position.z - 20, furthestObject.position.z - 200);
        obstacle.rotation.y = GeometryGenerators.randomFloat(0, Math.PI);
        obstacle.rotationCoefficient = GeometryGenerators.randomFloat(-0.07, 0.07);

        let obstacleSound = new THREE.PositionalAudio(cameraAudioListener);
        obstacleSound.setBuffer(environmentProvider.flybySound());
        obstacleSound.setVolume(0.8);
        obstacle.add(obstacleSound);

        obstacles.push(obstacle);

        scene.add(obstacle);
    }
}

var bonusesSpread = 3.0;

function regenerateBonuses() {

    clearObjectsBehindPlayer(bonuses.arrows, 0.5, false);
    clearObjectsBehindPlayer(bonuses.shields, 0.5, false);
    clearObjectsBehindPlayer(bonuses.stars, 0.5, false);

    let shieldsToGenerate = 4 - bonuses.shields.length;
    let starsToGenerate = 10 - bonuses.stars.length;
    let arrowsToGenerate = 6 - bonuses.arrows.length;

    let furthestShield = bonuses.shields.reduce(function(prev, current) {
        return (prev.position.z < current.position.z) ? prev : current
    }, environmentProvider.bonusShield());

    let furthestStar = bonuses.stars.reduce(function(prev, current) {
        return (prev.position.z < current.position.z) ? prev : current
    }, environmentProvider.bonusStar());

    let furthestArrow = bonuses.arrows.reduce(function(prev, current) {
        return (prev.position.z < current.position.z) ? prev : current
    }, environmentProvider.bonusBrake());

    for (i = 0; i < shieldsToGenerate; i++) {

        let shield = environmentProvider.bonusShield();

        shield.position.z = GeometryGenerators.randomFloat(furthestShield.position.z - 4, furthestShield.position.z - 100);
        shield.position.x = GeometryGenerators.randomFloat(-bonusesSpread, bonusesSpread);
        shield.position.y = GeometryGenerators.randomFloat(-bonusesSpread, bonusesSpread);

        shield.rotation.y = GeometryGenerators.randomFloat(0, Math.PI);

        let shieldSound = new THREE.PositionalAudio(cameraAudioListener);
        shieldSound.setBuffer(environmentProvider.pickupSound());
        shieldSound.setVolume(1.0);
        shield.add(shieldSound);

        bonuses.shields.push(shield);

        scene.add(shield);
    }

    for (i = 0; i < starsToGenerate; i++) {

        let star = environmentProvider.bonusStar();

        star.position.z = GeometryGenerators.randomFloat(furthestStar.position.z - 4, furthestStar.position.z - 100);
        star.position.x = GeometryGenerators.randomFloat(-bonusesSpread, bonusesSpread);
        star.position.y = GeometryGenerators.randomFloat(-bonusesSpread, bonusesSpread);

        star.rotation.y = GeometryGenerators.randomFloat(0, Math.PI);

        let starSound = new THREE.PositionalAudio(cameraAudioListener);
        starSound.setBuffer(environmentProvider.pickupSound());
        starSound.setVolume(1.0);
        star.add(starSound);

        bonuses.stars.push(star);

        scene.add(star);
    }

    for (i = 0; i < arrowsToGenerate; i++) {

        let arrow = environmentProvider.bonusBrake();

        arrow.position.z = GeometryGenerators.randomFloat(furthestArrow.position.z - 4, furthestArrow.position.z - 100);
        arrow.position.x = GeometryGenerators.randomFloat(-bonusesSpread, bonusesSpread);
        arrow.position.y = GeometryGenerators.randomFloat(-bonusesSpread, bonusesSpread);

        arrow.rotation.y = GeometryGenerators.randomFloat(0, Math.PI);

        let arrowSound = new THREE.PositionalAudio(cameraAudioListener);
        arrowSound.setBuffer(environmentProvider.pickupSound());
        arrowSound.setVolume(1.0);
        arrow.add(arrowSound);

        bonuses.arrows.push(arrow);

        scene.add(arrow);
    }
}

function adjustAudioPlaybackSpeed(modifier) {

    impactSound.setPlaybackRate(1.0 - modifier / 100);

    adjustEngineSoundSpeed(0.5 + modifier * 5);

    obstacles.forEach( function(obstacle) {
        if (obstacle.children.length > 0) {
            let sound = obstacle.children[0];
            sound.setPlaybackRate(2.0 + modifier);
        }
    });
}

const empty = new THREE.Object3D();

function regenerateLights() {

    clearObjectsBehindPlayer(lights, lightsSpacing * 5, false);

    let furthestObject = lights.reduce(function(prev, current) {
        return (prev.position.z < current.position.z) ? prev : current
    }, empty);

    let furthestDistance = furthestObject.position.z; //furthestObject != null ? furthestObject.position.z : -lightsSpacing;

    let lightsToGenerate = maxLights - lights.length;
    let sphere = new THREE.SphereGeometry( 0.3, 8, 6 );
    let diameterletoff = 0.3;
    for (i = 0; i <= lightsToGenerate; i++) {

        let light1 = new THREE.PointLight( tubeLightsColor, 0.3, 25 );
        light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: tubeLightsColor } ) ) );
        light1.position.x = Math.cos(90) * (tubeDiameter- diameterletoff);
        light1.position.y = Math.sin(90) * (tubeDiameter- diameterletoff);
        light1.position.z = furthestDistance - lightsSpacing;
        furthestDistance += lightsSpacing;
        environmentProvider.putGlowOnMesh(light1, new THREE.Vector3(1.1,1.1,1.1), 0x555555);
        lights.push(light1);
        scene.add(light1);
    }
}

function clearObjectsBehindPlayer(array, tolerance, playSound) {

    array.forEach( function(object, index, array) {
        if (object.position.z > tolerance) {
            array.splice(index, 1);

            if (playSound && object.children.length > 0) {
                let audio = object.children[0];
                audio.play();
            }

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

function blinkLightsGreen(times, onFinished) {
    var colorValues = {r: 1.0, b: 1.0, g: 1.0 };
    lightsBlinkingTween = new TWEEN.Tween(colorValues)
        .to({r: 0.0, b: 0.0, g: 1.0 }, 500)
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

function blinkLightsBlue(times, onFinished) {
    var colorValues = {r: 1.0, b: 1.0, g: 1.0 };
    lightsBlinkingTween = new TWEEN.Tween(colorValues)
        .to({r: 0.0, b: 1.0, g: 0.0 }, 500)
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

function adjustEngineSoundSpeed(desiredRate, onComplete) {

    engineSound.setPlaybackRate(desiredRate);
}

function playMusic(fromBeginning) {
    if (gameMusic != null) {
        gameMusic.pause();
    }

    let playbackStart = 0;
    if (!fromBeginning) {
        playbackStart = Math.floor(GeometryGenerators.randomFloat(0, 360));
    }

    gameMusic.offset = playbackStart;

    gameMusic.play();
}

function stopMusic() {
    gameMusic.stop();
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
    }

    shield = environmentProvider.shield();
    scene.add(shield);
    setShieldActive(false);
    setBrakeActive(false);

    cameraAudioListener = new THREE.AudioListener();
    camera.add(cameraAudioListener);
}

function setRunning(running) {

    if (running) {
        isRunning = true;
        interface.setIndicatorsVisibility(true);
        interface.setMenuVisibility(false);
        engineSound.play();
        playMusic(false);

    } else {
        isRunning = false;
        interface.setIndicatorsVisibility(false);
        interface.setMenuVisibility(true);

        if (distance > storage.getHighscore()) {
            storage.setHighscore(distance);
        }

        adjustEngineSoundSpeed(0.3);
        engineSound.stop();
        stopMusic();

        updateMenuValues();
    }
}

function setupScene(){
    interface.setLoadingVisibility(true);
    interface.setIndicatorsVisibility(false);
    interface.setMessageVisibility(false);
    interface.setMenuVisibility(false);

    let light = new THREE.AmbientLight( 0x444444 );
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

    if (tubes.length > 0) {
        mainTube = tubes[0];
    }

    environmentProvider.loadModels( function(){

        environmentProvider.loadSounds( function () {

            setupPlayer();

            environmentProvider.texturedTube(tube, environmentProvider.loadedTextures.gradient);

            let impactS = new THREE.Audio(cameraAudioListener);
            impactS.setBuffer(environmentProvider.impactSound());
            impactS.setVolume(0.6);
            impactSound = impactS;

            engineSound = new THREE.PositionalAudio(cameraAudioListener);
            engineSound.setBuffer(environmentProvider.engineSound());
            engineSound.setVolume(0.5);
            engineSound.setLoop(true);
            player.add(engineSound);

            gameMusic = new THREE.Audio(cameraAudioListener);
            gameMusic.setBuffer(environmentProvider.music());
            gameMusic.setVolume(0.1);
            gameMusic.setLoop(true);
            // scene.add(gameMusic);

            animate();

            interface.startButtonOnClickHandler(function() {
                reset();
            });

            updateMenuValues();

            interface.setLoadingVisibility(false);
            interface.setIndicatorsVisibility(false);
            interface.setMessageVisibility(false);
            interface.setMenuVisibility(true);
        });
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
        if (isRunning) {
            setBrakeActive(true);
        }
    }
}

function onMouseUp ( e ) {
    if (e.which === 1) {
        if (isRunning) {
            setShieldActive(false);
        }
    } else if (e.which === 3) {
        if (isRunning) {
            setBrakeActive(false);
        }
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

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

setupPosprocessing();
setupScene();