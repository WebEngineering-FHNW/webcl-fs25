
import {MISSING_FOREIGN_KEY, PREFIX_IMMORTAL} from "../../extension/relationalModelType.js";
import {clientId}                             from "../../kolibri/version.js";
import {LoggerFactory}                        from "../../kolibri/logger/loggerFactory.js";
import {Observable, ObservableList} from "../../kolibri/observable.js";
import {NO_PERSON, Person}          from "./personModel.js";

export { PersonController, PERSON_PREFIX, PERSON_ACTIVE_ID, PERSON_SELF_ID }

const log = LoggerFactory("ch.fhnw.app.person.personController");

const PERSON_PREFIX    = "PERSON-";
const PERSON_ACTIVE_ID = /** @type { ForeignKeyType } */ PREFIX_IMMORTAL + "PERSON_ACTIVE_ID";
const PERSON_SELF_ID   = /** @type { ForeignKeyType } */ PERSON_PREFIX + clientId;

/**
 * @typedef PersonControllerType
 * @property onPersonAdded
 * @property onPersonRemoved
 * @property onPersonChanged
 * @property setPersonChanged
 * @property setWeChanged
 * @property onActivePersonIdChanged
 * @property onWeHaveBecomeActive
 * @property isThereAnActivePerson
 * @property areWeInCharge
 * @property takeCharge
 * @property getPersonName
 * @property registerSelf
 * @property startListening
 * @property leave
 * @property thisIsUs
 * @property thisIsOurId
 * @property setOwnName
 */

/**
 * @constructor
 * @param { OMType } om
 * @param { () => void } onSetupFinished - callback when setup is finished as indicated by the fact that we ourselves have become known.
 * @returns { PersonControllerType }
 */
const PersonController = (om, onSetupFinished) => {

    /** @param { PersonType } person */
    const publish = person =>  om.setValue(person.id, person) ;
    const publishReferrer = (referrer, reference) =>  om.setValue(referrer, reference );
    /** @param {ForeignKeyType} personId */
    const publishRemoveKey = personId =>  om.removeKey(personId);

    /**
     * @private
     * @type { Array<PersonType> }
     */
    const knownPersonsBackingList = [];

    /** This is a local observable list to model the list of known persons.
     *  Each entry is a remotely observable person name, such that we can change
     *  the name in place.
     * @type {IObservableList<PersonType>}
     */
    const personListObs = ObservableList(knownPersonsBackingList);

    /** publish all person value changes
     * @type {IObservable<PersonType>} */
    const personChangeObs = Observable(/** @type { PersonType } */ NO_PERSON);

    /**
     * handle that a potentially new person has joined.
     * We maintain an observable list of known persons.
     * @impure updates the personListObs
     */
    const handlePersonUpdate = person => {
        const knownPersonIndex = knownPersonsBackingList.findIndex(it => it.id === person.id);
        if (knownPersonIndex >= 0) {
            knownPersonsBackingList[knownPersonIndex] = person;
        } else {
            log.info(`person joined: ${JSON.stringify(person)}`);
            personListObs.add(person);
            if (person.id === PERSON_SELF_ID) { // we are now known, which means the setup has finished
                onSetupFinished();
            }
        }
        personChangeObs.setValue(person);// normal person value update
    };

    /** @type { IObservable<ActivePersonIdType> }
     * foreign key (personId) to the id of the person that is currently in charge of the game.
     */
    const activePersonIdObs = Observable(MISSING_FOREIGN_KEY);

    const onWeHaveBecomeActive = callback => {
        activePersonIdObs.onChange( personId => {
           if (personId === PERSON_SELF_ID) { // we have become in charge
               callback();
           }
        });
    };

    /**
     * Whether we are in charge of moving the current tetromino.
     * @type { () => Boolean }
     * NB: when joining as a new person, the value might not yet be present,
     * but we are, of course, not in charge in that situation.
     */
    const areWeInCharge = () => activePersonIdObs.getValue() === PERSON_SELF_ID;

    /**
     * @impure puts us in charge and notifies all (remote) listeners.
     * @type { () => void }
     */
    const takeCharge = () => publishReferrer(PERSON_ACTIVE_ID, PERSON_SELF_ID);

    const getPersonName = (personId) => {
        const person = knownPersonsBackingList.find( it => it.id === personId);
        return person ? person.name : "n/a";
    };

    const isThereAnActivePerson = () => {
        return activePersonIdObs.getValue() !== MISSING_FOREIGN_KEY;
    };

    const registerSelf = () => {            // make ourselves known to the crowd
        publish( /** @type { PersonType } */ Person(PERSON_SELF_ID, PERSON_SELF_ID.slice(-7) ) );
    };

    const thisIsOurId = personId => PERSON_SELF_ID === personId;
    const thisIsUs    = person   => thisIsOurId(person?.id);

    const setOwnName = name => publish( /** @type { PersonType } */ Person(PERSON_SELF_ID, name) );


    const leave = () => {
        publishRemoveKey(PERSON_SELF_ID);
        if (areWeInCharge()) { // if we are in charge while leaving, put someone else in charge
            let nextCandidate = knownPersonsBackingList.at(0);
            if (thisIsUs(nextCandidate)) {          // if that is ourselves, try the next one
                nextCandidate = knownPersonsBackingList.at(1);
            }
            publishReferrer(PERSON_ACTIVE_ID, nextCandidate?.id ?? MISSING_FOREIGN_KEY);
        }
    };

    const startListening = () => {
        om.onKeyRemoved(key => {
            if (key.startsWith(PERSON_PREFIX)) {
                const person = knownPersonsBackingList.find(it => it.id === key);
                personListObs.del(person);
            }
        });

        om.onChange((key, value) => {
            if (key.startsWith(PERSON_PREFIX)) {
                handlePersonUpdate(value);
                return;
            }
            if (PERSON_ACTIVE_ID === key) {
                activePersonIdObs.setValue(value); // value is the id
            }
        });
    };


    return {
        onPersonAdded:           personListObs.onAdd,
        onPersonRemoved:         personListObs.onDel,
        onPersonChanged:         personChangeObs.onChange,
        setPersonChanged:        publish,
        onActivePersonIdChanged: activePersonIdObs.onChange,
        onWeHaveBecomeActive,
        isThereAnActivePerson,
        areWeInCharge,
        takeCharge,
        getPersonName,
        registerSelf,
        leave,
        startListening,
        thisIsUs,
        thisIsOurId,
        setOwnName
    };
};

