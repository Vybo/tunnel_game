class ModelProvider {

    constructor() {
        this.loadedModels = {
            easy1: null
        };
    }

    loadModels(onLoadedHandler) {
        var that = this;
        let loader = new THREE.JSONLoader();

        loader.load(
            'models/easy1.json',

            ( geometry ) => {
                let material = new THREE.MeshPhongMaterial( { color: GeometryGenerators.randomColor(), shininess: 300, specular: 0x111111 } );
                material.flatShading = false;
                let object = new THREE.Mesh( geometry, material );
                this.loadedModels.easy1 = object;

                onLoadedHandler();
            },
            function (progress) {
                console.log(progress)
            },
            function (error) {
                console.log(error);
            }
        );


    }

    easyObstacle() {
        let obstacle = this.loadedModels.easy1.clone();
        obstacle.material = new THREE.MeshPhongMaterial( { color: GeometryGenerators.randomColor(), shininess: 300, specular: 0x111111 } );
        obstacle.scale.set(5.1, 5.1, 5.1);
        obstacle.rotation.x = Math.PI / 2;
        obstacle.rotation.y += GeometryGenerators.randomFloat(0, Math.PI / 2);
        return obstacle;
    }
}

// ModelProvider.loadedModels = {
//     easy1: null
// };