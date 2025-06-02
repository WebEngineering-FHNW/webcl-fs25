import {ownPropEqual}             from "./util.js";
import {TestSuite}                from "../../kolibri/util/test.js";
import "../../kolibri/util/array.js"

const utilSuite = TestSuite("app/util");

utilSuite.add( "ownPropsEqual", assert => {
    assert.isTrue(ownPropEqual( document, document)); // invariant: same obj is props equal, even complex ones.
    assert.isTrue(ownPropEqual({}, {}));
    assert.isTrue(ownPropEqual({x:0}, {x:0}));
}) ;

utilSuite.run();
