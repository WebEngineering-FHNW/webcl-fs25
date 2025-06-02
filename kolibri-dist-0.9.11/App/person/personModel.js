
import {MISSING_FOREIGN_KEY} from "../../extension/relationalModelType.js";

export { Person, NO_PERSON}

/**
 * @typedef PersonType
 * @property { ForeignKeyType } id
 * @property { String }  name
 * Remotely stored with a key like "PERSON-<personId>". {@link PERSON_PREFIX}
 */

/**
 * @param { ForeignKeyType } id
 * @param { String } name
 * @constructor
 * @return {PersonType}
 */
const Person = (id, name) => /** @type { PersonType } */ ({id, name}); // for the type safety

/**
 * Null-Object Pattern
 * @type { PersonType }
 */
const NO_PERSON = /** @type { PersonType } */ Person(MISSING_FOREIGN_KEY, "no name");

/**
 * @typedef { ForeignKeyType } ActivePersonIdType
 * Remotely stored with a unique key see {@link PERSON_ACTIVE_ID}
 * The id of the person that is considered the "active" one, foreign key
 */
