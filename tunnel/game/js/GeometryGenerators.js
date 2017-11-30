class GeometryGenerators {

    static straightTube( scale, length ) {
        let v1 = new THREE.Vector3(0, 0, 0);
        let v2 = new THREE.Vector3(0, 0, length);
        let path = new THREE.LineCurve(v1, v2);

        let geometry = new THREE.TubeGeometry(path, 1, scale, 20, false);
        let material = new THREE.MeshPhongMaterial( { color: 0x2194ce, side: THREE.BackSide, shininess: 30, specular: 0xffffff } );
        let mesh = new THREE.Mesh(geometry, material);

        return mesh;
    }

    static cube() {
        let geometry = new THREE.BoxGeometry( 1, 1, 1 );
        let material = new THREE.MeshPhongMaterial( { color: 0x00ff00, shininess: 30, specular: 0xffffff } );
        let cube = new THREE.Mesh( geometry, material );

        return cube;
    }

    static redCube() {
        let geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
        let material = new THREE.MeshPhongMaterial( { color: 0xff0000, shininess: 30, specular: 0xffffff } );
        let cube = new THREE.Mesh( geometry, material );

        return cube;
    }

    static randomFloat(min, max) {
        return (Math.random() * (max - min) + min);
    }

    static randomColor() {
        return Math.random() * 0xffffff;
    }
}

