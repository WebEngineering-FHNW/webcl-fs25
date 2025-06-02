
import {TestSuite}                                  from "../../kolibri/util/test.js";
import {AppRootController } from "./appRootController.js";
import {OM}                                         from "../observableMap/om.js";
import {PERSON_SELF_ID}                             from "../person/personController.js";

const controllerSuite = TestSuite("appRoot/appRootController");

controllerSuite.add("construction", assert => {

    const om = OM("test", 0 /* no bounce */);
    const appRootController = AppRootController(om);

    assert.isTrue( appRootController !== undefined );
    assert.isTrue( appRootController.personController !== undefined );

    let reached = false;
    const afterStartCallback = _ => {
        reached = true;
    };
    appRootController.startApp(afterStartCallback);

    assert.is(reached, true);

    // should we be registered by now?
    // om.getValue(PERSON_SELF_ID)
    //   (_ => assert.isTrue(false))
    //   (p => assert.isTrue(p !== undefined));



});


controllerSuite.run();
