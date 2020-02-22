import { AppController } from './appController';

let appController;

$(document).ready(() => {
    if (!appController) {
        appController = new AppController();
    }
    appController.initialize();
});
