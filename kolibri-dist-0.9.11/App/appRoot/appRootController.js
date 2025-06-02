import {LoggerFactory}    from "../../kolibri/logger/loggerFactory.js";
import {PersonController} from "../person/personController.js";

export { AppRootController };

const log = LoggerFactory("ch.fhnw.app.appRoot.appRootController");

/**
 * @typedef AppRootControllerType
 * @property personController
 * @property startApp
 */

/**
 * @constructor
 * @param { OMType } om
 * @returns { AppRootControllerType }
 */
const AppRootController = om => {

    const onSetupFinished = () => {
        log.info("app ready to go");
    };

    const personController    = PersonController   (om, onSetupFinished);


    /**
     * @param { () => void } afterStartCallback - what to do after start action is finished
     */
    const startApp = (afterStartCallback) => {

        // clean up when leaving (as good as possible - not 100% reliable)
        window.onbeforeunload = (_evt) => {
            personController.leave();
        };

        personController.registerSelf();

        afterStartCallback(); // the UI can be bound

        personController   .startListening();

    };

    return {
        startApp,
        personController,
    }
};
