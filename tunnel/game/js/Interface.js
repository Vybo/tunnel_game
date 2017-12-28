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
        this.menu = $('.menu');
        this.startButton = $('.startButton');
        this.highscore = $('.highscore');
        this.currentScore = $('.currentscore');
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

    setMenuVisibility(visible) {

            if (visible) {
                this.menu.show();
            } else {
                this.menu.hide();
            }
    }

    updateHighscore(score) {
        this.highscore.text(score + " m");
    }

    updateCurrentScore(score) {
        this.currentScore.text(score.toFixed(2) + " m");
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

    startButtonOnClickHandler(handler) {
        this.startButton.click(handler);
    }
}