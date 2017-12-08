class Helpers {

    static particlePositionForShip(ship, shipPosition) {

        if (ship == "ship1") {
            return new THREE.Vector3(shipPosition.x, shipPosition.y, shipPosition.z + 0.3);
        } else {
            return shipPosition;
        }
    }
}