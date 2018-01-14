class EnvironmentProvider {
    static flatShading () {
        return false;
    }

    constructor() {
        this.loadedObstacles = {
            easy1: null,
            easy2: null,
            easy3: null,
            easy4: null
        };

        this.loadedShips = {
            ship1: null,
            ship2: null
        };

        this.allModels = {
            easyObstacles: null,
            ships: null,
            shield: null,
            bonusShield: null,
            bonusStar: null,
            bonusBrake: null
        };

        this.allSounds = {
            engine: null,
            flyby: null,
            impact: null
        };

        this.loadedTextures = {
            concrete: null,
            nebula: null,
            snow: null,
            brick: null,
            polys: null,
            splatter4: null,
            gradient: null
        }
    }

    loadModels(onLoadedHandler) {
        var that = this;

        let manager = new THREE.LoadingManager();
        let manager2 = new THREE.LoadingManager();

        let textureLoader = new THREE.TextureLoader(manager2);

        manager.onStart = function (url, itemsLoaded, itemsTotal) {
            console.log("Started loading " + url);
        };
        manager.onLoad = function () {
            console.log("Finished loading everything.");
            that.allModels.easyObstacles = [that.loadedObstacles.easy1, that.loadedObstacles.easy2, that.loadedObstacles.easy3, that.loadedObstacles.easy4];
            that.allModels.ships = [that.loadedShips.ship1, that.loadedShips.ship2];

            let shipSize = new THREE.Box3().setFromObject( that.ship() ).getSize();
            let shieldGeometry = new THREE.SphereGeometry(shipSize.x - 0.4, shipSize.y, shipSize.z - 0.05);
            let shieldMaterial = new THREE.MeshStandardMaterial({ color: "#5c77ff", transparent: true, side: THREE.DoubleSide, alphaTest: 0, shininess: 300, specular: 0x111111 });
            let alphaMap = null;

            textureLoader.load('textures/shield.jpg',

                ( texture ) => {
                    alphaMap = texture;
                    shieldMaterial.alphaMap = alphaMap;
                    shieldMaterial.alphaMap.magFilter = THREE.NearestFilter;
                    shieldMaterial.alphaMap.wrapT = THREE.RepeatWrapping;
                    shieldMaterial.alphaMap.repeat.y = 1;

                    let shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);

                    that.allModels.shield = shieldMesh;
            });

            // textureLoader.load('textures/snow.png',
            //
            //     ( texture ) => {
            //
            //         that.loadedTextures.snow = texture;
            // });
            //
            // textureLoader.load('textures/nebula.jpg',
            //
            //     ( texture ) => {
            //
            //         that.loadedTextures.nebula = texture;
            // });
            //
            // textureLoader.load('textures/concrete.jpg',
            //
            //     ( texture ) => {
            //
            //         that.loadedTextures.concrete = texture;
            // });

            textureLoader.load('textures/stone.jpg',

                ( texture ) => {

                    that.loadedTextures.brick = texture;
            });

            textureLoader.load('textures/gradient.png',

                ( texture ) => {

                    that.loadedTextures.gradient = texture;
                });

            // textureLoader.load('textures/polys.jpg',
            //
            //     ( texture ) => {
            //
            //         that.loadedTextures.polys = texture;
            // });

            textureLoader.load('textures/paint-splatter-4.png',

                ( texture ) => {

                    that.loadedTextures.splatter4 = texture;
                });

        };
        manager.onProgress = function (url, itemsLoaded, itemsTotal) {
            console.log("Finished " + url + ". Items loaded: " + itemsLoaded + " of total: " + itemsTotal + ".");
        };
        manager.onError = function (url) {
            console.log("Error for " + url + "!");
        };
        
        manager2.onLoad = function () {
            onLoadedHandler();
        }

        let jsonLoader = new THREE.JSONLoader(manager);
        let mtlLoader = new THREE.MTLLoader(manager);
        let objLoader = new THREE.OBJLoader(manager);

        mtlLoader.load(
            'models/ship01.mtl',

            ( materials ) => {
                materials.preload();
                objLoader.setMaterials(materials);

                objLoader.load(
                    'models/ship01.obj',

                    ( object ) => {
                        this.loadedShips.ship1 = object;
                    }
                );
            }
        );

        // mtlLoader.load(
        //     'models/ship02.mtl',
        //
        //     ( materials ) => {
        //         materials.preload();
        //         objLoader.setMaterials(materials);
        //
        //         objLoader.load(
        //             'models/ship02.obj',
        //
        //             ( object ) => {
        //                 this.loadedShips.ship2 = object;
        //             }
        //         );
        //     }
        // );

        mtlLoader.load(
            'models/arrow.mtl',

            ( materials ) => {
                materials.preload();

                objLoader = new THREE.OBJLoader(manager);
                objLoader.setMaterials(materials);

                objLoader.load(
                    'models/arrow.obj',

                    ( object ) => {
                        this.allModels.bonusBrake = object;
                    }
                );
            }
        );

        mtlLoader.load(
            'models/shield.mtl',

            ( materials ) => {
                materials.preload();

                objLoader = new THREE.OBJLoader(manager);
                objLoader.setMaterials(materials);

                objLoader.load(
                    'models/shield.obj',

                    ( object ) => {
                        this.allModels.bonusShield = object;
                    }
                );
            }
        );

        mtlLoader.load(
            'models/star.mtl',

            ( materials ) => {
                materials.preload();

                objLoader = new THREE.OBJLoader(manager);
                objLoader.setMaterials(materials);

                objLoader.load(
                    'models/star.obj',

                    ( object ) => {
                        this.allModels.bonusStar = object;
                    }
                );
            }
        );

        jsonLoader.load(
            'models/easy1.json',

            ( geometry ) => {
                let material = new THREE.MeshPhongMaterial( { color: GeometryGenerators.randomColor(), shininess: 300, specular: 0x111111 } );
                material.flatShading = EnvironmentProvider.flatShading();
                let object = new THREE.Mesh( geometry, material );
                this.loadedObstacles.easy1 = object;
            }
        );

        jsonLoader.load(
            'models/easy2.json',

            ( geometry ) => {
                let material = new THREE.MeshPhongMaterial( { color: GeometryGenerators.randomColor(), shininess: 300, specular: 0x111111 } );
                material.flatShading = EnvironmentProvider.flatShading();
                let object = new THREE.Mesh( geometry, material );
                this.loadedObstacles.easy2 = object;
            }
        );

        jsonLoader.load(
            'models/easy3.json',

            ( geometry ) => {
                let material = new THREE.MeshPhongMaterial( { color: GeometryGenerators.randomColor(), shininess: 300, specular: 0x111111 } );
                material.flatShading = EnvironmentProvider.flatShading();
                let object = new THREE.Mesh( geometry, material );
                this.loadedObstacles.easy3 = object;
            }
        );

        jsonLoader.load(
            'models/easy4.json',

            ( geometry ) => {
                let material = new THREE.MeshPhongMaterial( { color: GeometryGenerators.randomColor(), shininess: 300, specular: 0x111111 } );
                material.flatShading = EnvironmentProvider.flatShading();
                let object = new THREE.Mesh( geometry, material );
                this.loadedObstacles.easy4 = object;
            }
        );
    }

    loadSounds(onLoadedHandler) {

        let that = this;

        let audioLoader = new THREE.AudioLoader();

        let audioErrorFunction = function(err) {
            console.log(err);
        };

        audioLoader.load(
            'sounds/engine.mp3',

            function ( buffer ) {

                that.allSounds.engine = buffer;
                console.log("Engine sound");

                audioLoader.load(
                    'sounds/flyby.mp3',

                    function ( buffer2 ) {

                        that.allSounds.flyby = buffer2;
                        console.log("Flyby sound");

                        audioLoader.load(
                            'sounds/impact.mp3',

                            function ( buffer3 ) {

                                that.allSounds.impact = buffer3;
                                console.log("Impact sound");

                                onLoadedHandler();
                            },
                            null,
                            audioErrorFunction
                        );

                    },
                    null,
                    audioErrorFunction
                );
            },
            null,
            audioErrorFunction
        );
    }

    easyObstacle() {
        let model = this.randomObject(this.allModels.easyObstacles);
        let obstacle = model.clone();

        let scale = 0.1 + tubeDiameter;
        obstacle.scale.set(scale, scale, scale);
        obstacle.rotation.x = Math.PI / 2;
        obstacle.rotation.y += GeometryGenerators.randomFloat(0, Math.PI / 2);
        obstacle.position.z = -1; // Default distance when generated, used by reduce function in engine.

        // obstacle.material = new THREE.MeshBasicMaterial({
        //     side: THREE.FrontSide,
        //     map: this.loadedTextures.brick.clone()
        // });

        obstacle.material = new THREE.MeshPhongMaterial( { color: GeometryGenerators.randomColor(), shininess: 50, specular: 0x111111 } );

        // obstacle.material.flatShading = EnvironmentProvider.flatShading();
        //
        // // obstacle.material.map = this.loadedTextures.brick.clone();
        // obstacle.material.map.wrapS = THREE.ClampToEdgeWrapping;
        // // obstacle.material.map.wrapT = THREE.ClampToEdgeWrapping;
        // obstacle.material.map.repeat.set(1, 1);

        // let params = {
        //     minScale: scale,
        //     maxScale: 2*scale,
        //     rotate: true
        // };
        //
        // let decalMaterial = new THREE.MeshPhongMaterial( {
        //     specular: 0x444444,
        //     map: this.loadedTextures.splatter4,
        //     shininess: 30,
        //     transparent: true,
        //     depthTest: true,
        //     depthWrite: false,
        //     wireframe: false,
        //     color: GeometryGenerators.randomColor()
        // } );
        //
        // let randomScale = params.minScale + Math.random() * ( params.maxScale - params.minScale );
        // let position = new THREE.Vector3(0,0,0);
        // let orientation = new THREE.Vector3(0,0,0);
        // let size = new THREE.Vector3(randomScale, randomScale, randomScale);

        // let splatteredObstacle = new THREE.Mesh( new THREE.DecalGeometry( obstacle, position, orientation, size ), decalMaterial );
        // splatteredObstacle.rotation.x = Math.PI / 2;
        // splatteredObstacle.rotation.y += GeometryGenerators.randomFloat(0, Math.PI / 2);
        // splatteredObstacle.scale.set(scale, scale, scale);

        // return splatteredObstacle;
        return obstacle;
    }

    randomObject(array) {
        return array[Math.floor(Math.random()*array.length)];
    }

    ship() {
        let ship = this.loadedShips.ship1.clone();
        ship.scale.set(0.002, 0.002, 0.002);
        ship.position.set(0, 0, 0);
        ship.rotateY(Math.PI);
        ship.children[0].material.forEach(function(material) { material.shininess = 500; });
        return ship;
    }

    shield() {
        return this.allModels.shield;
    }

    flybySound() {
        return this.allSounds.flyby;
    }

    engineSound() {
        return this.allSounds.engine;
    }

    impactSound() {
        return this.allSounds.impact;
    }

    bonusShield() {
        return this.allModels.bonusShield.clone();
    }

    bonusStar() {
        return this.allModels.bonusStar.clone();
    }

    bonusBrake() {
        return this.allModels.bonusBrake.clone();
    }

    texturedTube(tube, texture) {

        let newMaterial = new THREE.MeshStandardMaterial({
            side: THREE.BackSide,
            map: texture
        });

        newMaterial.emissive = new THREE.Color(255, 255, 255);
        newMaterial.emissiveIntensity = 0.0001;

        newMaterial.map.wrapS = THREE.RepeatWrapping;
        newMaterial.map.wrapT = THREE.RepeatWrapping;
        newMaterial.map.repeat.set(25, 1);
        tube.material = newMaterial;
    }
}