import "../../kolibri/util/array.js";
import {dom, select}              from "../../kolibri/util/dom.js";
import {LoggerFactory}            from "../../kolibri/logger/loggerFactory.js";
import {MISSING_FOREIGN_KEY} from "../../extension/relationalModelType.js";
import {projectPersonList}   from "../person/personProjector.js";

export {projectGame};

const log = LoggerFactory("ch.fhnw.kolibri.tetris.gameProjector");

/**
 * Create the control panel view and bind to the controller actions
 * @param { AppRootControllerType } appRootController
 * @return { HTMLCollection }
 */
const projectMainView = appRootController => {
    const view              = dom(`
    <header>
        <div class="self"><input size=10></div>
    </header>`);

    const [header]          = view;

    const personController = appRootController.personController;
    header.append(...projectPersonList(personController));

    const [selfInput]       = select(header, "div.self input");

    // data binding

    personController.onActivePersonIdChanged( _ => {
        if (personController.areWeInCharge()) {
            header.classList.add("active");
        } else {
            header.classList.remove("active");
        }
    });

    const updatePersonNameInput = person  => {
        if(personController.thisIsUs(person)) {
            selfInput.value = person.name;
        }
    };
    personController.onPersonAdded  ( updatePersonNameInput);
    personController.onPersonChanged( updatePersonNameInput);

    selfInput.oninput = _event => {
            personController.setOwnName( selfInput.value );
    };

    return view;
};

/**
 * @param { AppRootControllerType} appRootController
 * @return { Array<HTMLElement> }
 */
const projectGame = appRootController => {
    return [
        ...projectMainView(appRootController)
    ];

};
