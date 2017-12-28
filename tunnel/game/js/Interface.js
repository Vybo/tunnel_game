/**
 * Created by dan on 28/12/2017.
 */

class Interface {

    constructor() {
        this.loadingScreen = $('.loading');
        this.indicators = $('.indicators');
        this.speed = $('.speed');
        this.distance = $('.distance');
        this.shield = $('.shield');
        this.brake = $('.brake');
    }

    setLoadingVisibility(visible) {

        if (visible) {
            this.loadingScreen.show();
        } else {
            this.loadingScreen.hide();
        }
    }

    setIndicatorsVisibility(visible) {

        if (visible) {
            this.indicators.show();
        } else {
            this.indicators.hide();
        }
    }

    updateSpeed(speed) {
        this.speed.text(speed.toFixed(2) + " m/s");
    }

    updateDistance(distance) {
        this.distance.text(distance.toFixed(2) + " m");
    }

    updateShield(shield) {
        this.shield.text(shield.toFixed(0) + " %");
    }

    udpateBrake(brake) {
        this.brake.text(brake.toFixed(0) + " %");
    }
}