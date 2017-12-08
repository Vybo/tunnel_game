class ModelProvider {

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
            ships: [this.loadedShips.ship1, this.loadedShips.ship2]
        };
    }

    loadModels(onLoadedHandler) {
        var that = this;

        let manager = new THREE.LoadingManager();

        manager.onStart = function (url, itemsLoaded, itemsTotal) {
            console.log("Started loading " + url);
        };
        manager.onLoad = function () {
            console.log("Finished loading everything.");
            that.allModels.easyObstacles = [that.loadedObstacles.easy1, that.loadedObstacles.easy2, that.loadedObstacles.easy3, that.loadedObstacles.easy4];
            onLoadedHandler();
        };
        manager.onProgress = function (url, itemsLoaded, itemsTotal) {
            console.log("Finished " + url + ". Items loaded: " + itemsLoaded + " of total: " + itemsTotal + ".");
        };
        manager.onError = function (url) {
            console.log("Error for " + url + "!");
        };

        let jsonLoader = new THREE.JSONLoader(manager);

        jsonLoader.load(
            'models/easy1.json',

            ( geometry ) => {
                let material = new THREE.MeshPhongMaterial( { color: GeometryGenerators.randomColor(), shininess: 300, specular: 0x111111 } );
                material.flatShading = false;
                let object = new THREE.Mesh( geometry, material );
                this.loadedObstacles.easy1 = object;
            }
        );

        jsonLoader.load(
            'models/easy2.json',

            ( geometry ) => {
                let material = new THREE.MeshPhongMaterial( { color: GeometryGenerators.randomColor(), shininess: 300, specular: 0x111111 } );
                material.flatShading = false;
                let object = new THREE.Mesh( geometry, material );
                this.loadedObstacles.easy2 = object;
            }
        );

        jsonLoader.load(
            'models/easy3.json',

            ( geometry ) => {
                let material = new THREE.MeshPhongMaterial( { color: GeometryGenerators.randomColor(), shininess: 300, specular: 0x111111 } );
                material.flatShading = false;
                let object = new THREE.Mesh( geometry, material );
                this.loadedObstacles.easy3 = object;
            }
        );

        jsonLoader.load(
            'models/easy4.json',

            ( geometry ) => {
                let material = new THREE.MeshPhongMaterial( { color: GeometryGenerators.randomColor(), shininess: 300, specular: 0x111111 } );
                material.flatShading = false;
                let object = new THREE.Mesh( geometry, material );
                this.loadedObstacles.easy4 = object;
            }
        );
    }

    easyObstacle() {
        let model = this.randomObject(this.allModels.easyObstacles);
        let obstacle = model.clone();
        obstacle.material = new THREE.MeshPhongMaterial( { color: GeometryGenerators.randomColor(), shininess: 50, specular: 0x111111 } );
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
}