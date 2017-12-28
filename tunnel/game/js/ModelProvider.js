class ModelProvider {
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
            shield: null
        };
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
            let shieldMaterial = new THREE.MeshStandardMaterial({ color: "#3b26ee", transparent: true, side: THREE.DoubleSide, alphaTest: 0 });
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

        mtlLoader.load(
            'models/ship02.mtl',

            ( materials ) => {
                materials.preload();
                objLoader.setMaterials(materials);

                objLoader.load(
                    'models/ship02.obj',

                    ( object ) => {
                        this.loadedShips.ship2 = object;
                    }
                );
            }
        );

        jsonLoader.load(
            'models/easy1.json',

            ( geometry ) => {
                let material = new THREE.MeshPhongMaterial( { color: GeometryGenerators.randomColor(), shininess: 300, specular: 0x111111 } );
                material.flatShading = ModelProvider.flatShading();
                let object = new THREE.Mesh( geometry, material );
                this.loadedObstacles.easy1 = object;
            }
        );

        jsonLoader.load(
            'models/easy2.json',

            ( geometry ) => {
                let material = new THREE.MeshPhongMaterial( { color: GeometryGenerators.randomColor(), shininess: 300, specular: 0x111111 } );
                material.flatShading = ModelProvider.flatShading();
                let object = new THREE.Mesh( geometry, material );
                this.loadedObstacles.easy2 = object;
            }
        );

        jsonLoader.load(
            'models/easy3.json',

            ( geometry ) => {
                let material = new THREE.MeshPhongMaterial( { color: GeometryGenerators.randomColor(), shininess: 300, specular: 0x111111 } );
                material.flatShading = ModelProvider.flatShading();
                let object = new THREE.Mesh( geometry, material );
                this.loadedObstacles.easy3 = object;
            }
        );

        jsonLoader.load(
            'models/easy4.json',

            ( geometry ) => {
                let material = new THREE.MeshPhongMaterial( { color: GeometryGenerators.randomColor(), shininess: 300, specular: 0x111111 } );
                material.flatShading = ModelProvider.flatShading();
                let object = new THREE.Mesh( geometry, material );
                this.loadedObstacles.easy4 = object;
            }
        );
    }

    easyObstacle() {
        let model = this.randomObject(this.allModels.easyObstacles);
        let obstacle = model.clone();
        obstacle.material = new THREE.MeshPhongMaterial( { color: GeometryGenerators.randomColor(), shininess: 50, specular: 0x111111 } );
        obstacle.material.flatShading = ModelProvider.flatShading();
        let scale = 0.1 + tubeDiameter;
        obstacle.scale.set(scale, scale, scale);
        obstacle.rotation.x = Math.PI / 2;
        obstacle.rotation.y += GeometryGenerators.randomFloat(0, Math.PI / 2);
        obstacle.position.z = -1; // Default distance when generated, used by reduce function in engine.
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
        ship.children[0].material.forEach(function(material) { material.shininess = 500; material.flatShading = ModelProvider.flatShading(); });
        return ship;
    }

    shield() {
        return this.allModels.shield;
    }
}