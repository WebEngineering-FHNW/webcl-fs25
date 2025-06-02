import {dom, select}              from "../../kolibri/util/dom.js";
import {LoggerFactory}            from "../../kolibri/logger/loggerFactory.js";
import {MISSING_FOREIGN_KEY}      from "../../extension/relationalModelType.js";

export { projectPersonList };

const log = LoggerFactory("ch.fhnw.tetris.personProjector");

/**
 * @param { PersonControllerType } personController
 * @return { HTMLCollection }
 */
const projectPersonList = personController => {
    const view = dom(`
        <div class="personList">
            <ul></ul>
        </div>
    `);
    const [personList] = select(view[0], "ul");

    // data binding

    // give the active person the css class "active", remove it from all other person items
    personController.onActivePersonIdChanged(/** @type { ForeignKeyType } */ personId => {
        for(const li of personList.children) {
            li.classList.remove("active");
            if (li.getAttribute("data-id") === personId) {
                li.classList.add("active");
            }
        }
    });

    // when active person changes - put him/her on top of the list
    personController.onActivePersonIdChanged(/** @type { ForeignKeyType } */ personId => {
        const [activePersonLi] = select(personList, `[data-id="${personId}"]`);
        if (!activePersonLi) {
            return;
        }
        activePersonLi.remove();
        personList.prepend(activePersonLi);
    });

    personController.onPersonAdded(person => {
        const [liView] = dom(`<li data-id="${person.id}">${person.name}</li>`);
        personList.append(liView);
    });
    personController.onPersonRemoved( removedPerson => {
        const [li] = select(personList, `[data-id="${removedPerson.id}"]`);
        li?.remove();
    });
    personController.onPersonChanged( person  => {
        if (MISSING_FOREIGN_KEY === person.id) return; // when starting
        const [li] = select(personList, `[data-id="${person.id}"]`);
        li.textContent = person.name;
    });

    return view;
};
