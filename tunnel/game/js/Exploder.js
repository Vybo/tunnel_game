class Exploder {

    constructor(model, scene) {
        this.scale = 0.02;
        this.model = model;
        this.model.geometry.computeFaceNormals();
        this.model.geometry.computeVertexNormals();

        this.model.geometry.vertices.forEach(function(v) {
            v.velocity = Math.random();
        });

        this.avgVertexCount = null
        this.avgVertexNormals = null;

        this.scene = scene;

        this.createParticleSystemFromGeometry(this.model.geometry);
        this.psM = null;
    }

    createParticleSystemFromGeometry(geom) {
        var psMat = new THREE.PointCloudMaterial();
        psMat.map = THREE.ImageUtils.loadTexture('textures/ps_ball.png');
        psMat.blending = THREE.AdditiveBlending;
        psMat.transparent = true;
        psMat.color = new THREE.Color(0, 1, 1);
        psMat.opacity = 0.9;
        var ps = new THREE.PointCloud(geom, psMat);
        ps.sortParticles = true;

        this.psM = ps;

        this.scene.add(this.psM);

        for (var i = 0; i < this.model.geometry.vertices.length; i++) {
            this.avgVertexNormals.push(new THREE.Vector3(0, 0, 0));
            this.avgVertexCount.push(0);
        }
        // first add all the normals
        this.model.geometry.faces.forEach(function (f) {
            var vA = f.vertexNormals[0];
            var vB = f.vertexNormals[1];
            var vC = f.vertexNormals[2];
            // update the count
            this.avgVertexCount[f.a] += 1;
            this.avgVertexCount[f.b] += 1;
            this.avgVertexCount[f.c] += 1;
            // add the vector
            this.avgVertexNormals[f.a].add(vA);
            this.avgVertexNormals[f.b].add(vB);
            this.avgVertexNormals[f.c].add(vC);
        });
        // then calculate the average
        for (var i = 0; i < this.avgVertexNormals.length; i++) {
            this.avgVertexNormals[i].divideScalar(this.avgVertexCount[i]);
        }
    }

    explodeTick() {
        var dir = 1;

        var count = 0;

        this.model.geometry.vertices.forEach(function (v) {
            v.x += (this.avgVertexNormals[count].x * v.velocity * this.scale) * dir;
            v.y += (this.avgVertexNormals[count].y * v.velocity * this..scale) * dir;
            v.z += (this.avgVertexNormals[count].z * v.velocity * this..scale) * dir;
            count++;
        });

        this.model.geometry.verticesNeedUpdate = true;
    }

    finishExplosion() {
        this.scene.remove(this.psM);
        this.scene.remove(this.model);
    }
}