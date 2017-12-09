class Exploder {

    constructor(model, scene) {
        this.scale = 0.05;
        this.model = model;
        this.model.geometry.computeFaceNormals();
        this.model.geometry.computeVertexNormals();
        this.model.geometry.vertices.forEach(function(v) {
            v.velocity = Math.random();
        });

        this.avgVertexCount = []
        this.avgVertexNormals = [];

        this.scene = scene;

        this.createParticleSystemFromGeometry(this.model.geometry);
        this.psM = null;
        this.oldVertices = this.model.geometry.vertices.slice();
    }

    createParticleSystemFromGeometry(geom) {
        // var psMat = new THREE.PointCloudMaterial();
        // psMat.map = THREE.ImageUtils.loadTexture('textures/ps_ball.png');
        // psMat.blending = THREE.AdditiveBlending;
        // psMat.transparent = true;
        // psMat.color = new THREE.Color(0, 1, 1);
        // psMat.opacity = 0.9;
        // var ps = new THREE.PointCloud(geom, psMat);
        // ps.sortParticles = true;
        //
        // this.psM = ps;

        this.scene.add(this.model);
        // this.scene.add(this.psM);

        let that = this;

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
            that.avgVertexCount[f.a] += 1;
            that.avgVertexCount[f.b] += 1;
            that.avgVertexCount[f.c] += 1;
            // add the vector
            that.avgVertexNormals[f.a].add(vA);
            that.avgVertexNormals[f.b].add(vB);
            that.avgVertexNormals[f.c].add(vC);
        });
        // then calculate the average
        for (var i = 0; i < this.avgVertexNormals.length; i++) {
            this.avgVertexNormals[i].divideScalar(this.avgVertexCount[i]);
        }
    }

    explodeTick() {
        var dir = 1;

        var count = 0;

        let that = this;

        this.model.geometry.vertices.forEach(function (v) {
            v.x += (that.avgVertexNormals[count].x * v.velocity * that.scale) * dir;
            v.y += (that.avgVertexNormals[count].y * v.velocity * that.scale) * dir;
            v.z += (that.avgVertexNormals[count].z * v.velocity * that.scale) * dir;
            count++;
        });

        this.model.position.z = -5;

        this.model.geometry.verticesNeedUpdate = true;
    }

    finishExplosion() {
        // this.scene.remove(this.psM);
        this.scene.remove(this.model);
    }
}