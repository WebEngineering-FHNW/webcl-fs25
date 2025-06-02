import {AppRootController,}    from "./appRoot/appRootController.js";
import {defaultConsoleLogging} from "../kolibri/logger/loggingSupport.js";
import {projectGame}           from "./appRoot/appRootProjector.js";
import {connect}               from "../server/S8-OM-SSE/connect.js";
import {OM}                  from "./observableMap/om.js";
import {LOG_DEBUG, LOG_WARN} from "../kolibri/logger/logLevel.js";

defaultConsoleLogging("ch.fhnw.app", LOG_INFO);

const om = OM("index.html", 10); // 1 in minimum to make updates async

connect(window.location.origin, om);

const gameController = AppRootController(om);

gameController.startApp(_ => {
    document.body.append(...projectGame(gameController));
});
