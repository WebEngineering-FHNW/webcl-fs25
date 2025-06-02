
export { ownPropEqual }

// todo: might go into Kolibri utils.
/**
 * Tell, whether two abjects have the same ownProperties.
 * @template _T_
 * @type {  <_T_> (objA:_T_, objB:_T_) => Boolean }
 */
const ownPropEqual = (objA, objB) =>
    Object.getOwnPropertyNames(objA).every( name => objA[name] === objB[name]);
