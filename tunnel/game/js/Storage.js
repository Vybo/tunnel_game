/**
 * Created by dan on 28/12/2017.
 */

class Storage {

    constructor() {
        this.highScore = 0;
    }

    getCookie(cname) {

        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');

        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    getHighscore() {
        this.highScore = this.getCookie("highscore");
        return this.highScore;
    }

    setHighscore(highscore) {
        this.highScore = highscore;
        this.setCookie("highscore", highscore.toFixed(2), 365);
    }
}