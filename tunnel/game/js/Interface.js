/**
 * Created by dan on 28/12/2017.
 */

class Interface {
    constructor() {
        this.loadingScreen = $('.loading');
    }

    setLoadingVisibility(visible, onFinish) {

        if (visible) {
            this.loadingScreen.show();
        } else {
            this.loadingScreen.hide();
        }
    }
}