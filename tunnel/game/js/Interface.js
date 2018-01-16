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
        this.message = $('.message');
        this.messageHeader = $('.message-first');
        this.messageText = $('.message-second');

        this.messageTimeout = null;
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

    setMessageVisibility(visible) {
        if (visible) {
            this.message.show();
        } else {
            this.message.hide();
        }
    }

    updateMessage(header, message) {
        this.messageHeader.text(header);
        this.messageText.text(message);
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

    updateBrake(brake) {
        this.brake.text(brake.toFixed(0) + " %");
    }

    startButtonOnClickHandler(handler) {
        this.startButton.click(handler);
    }

    flashMessage(header, message) {

        this.updateMessage(header, message);
        this.setMessageVisibility(true);

        if (this.messageTimeout != null) {
            window.clearTimeout(this.messageTimeout);
        }

        var that = this;

        this.messageTimeout = setTimeout(function() { that.setMessageVisibility(false) }, 1000);



        // this.messageHeader.textillate({
        //     selector: '.texts',
        //     loop: false,
        //     minDisplayTime: 1000,
        //     initialDelay: 0,
        //     autoStart: true,
        //     inEffects: [ ],
        //     outEffects: [],
        //     in: {
        //         effect: 'fadeInRight',
        //         delayScale: 1.5,
        //         delay: 50,
        //         sync: false,
        //         shuffle: false,
        //         reverse: false,
        //         callback: function() {}
        //     },
        //     out: {
        //         effect: 'fadeOutRight',
        //         delayScale: 1.5,
        //         delay: 50,
        //         sync: false,
        //         shuffle: false,
        //         reverse: false,
        //         callback: function() {}
        //     },
        //     callback: function() {},
        //     type: 'char'
        // });
        //
        // this.messageText.textillate({
        //     selector: '.texts',
        //     loop: false,
        //     minDisplayTime: 500,
        //     initialDelay: 0,
        //     autoStart: true,
        //     inEffects: [ ],
        //     outEffects: [],
        //     in: {
        //         effect: 'fadeInRight',
        //         delayScale: 1.0,
        //         delay: 50,
        //         sync: false,
        //         shuffle: false,
        //         reverse: false,
        //         callback: function() {}
        //     },
        //     out: {
        //         effect: 'fadeOutRight',
        //         delayScale: 1.0,
        //         delay: 50,
        //         sync: false,
        //         shuffle: false,
        //         reverse: false,
        //         callback: function() {}
        //     },
        //     callback: function() {
        //         that.setMessageVisibility(false);
        //     },
        //     type: 'char'
        // });

    }
}