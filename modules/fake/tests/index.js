import fake from '#fake';
import identity from '#identity';
import seq from '#seq';
import take from '#take';
import thunk from '#thunk';

import { test } from 'uvu';
import * as assert from 'uvu/assert';

function testSequence(description, invoke) {
	const n = 4;
	for (let i = 0; i < n; i++)
		test(`FAKE() produces 1...${i} when fake() is given ${description}`, function () {
			const { FAKE } = invoke(i);
			for (let j = 1; j <= i; j++) {
				assert.is(FAKE(), j);
			}
			assert.is(FAKE(), undefined);
			assert.is(FAKE(), undefined);
		});
}
testSequence('the values themselves', function (i) {
	return fake(...take(i, seq()));
});
testSequence('functions returning the values', function (i) {
	const fns = [];
	for (const value of take(i, seq())) fns.push(thunk(identity, [value]));
	return fake(...fns);
});
testSequence('a generator function returning the values', function (i) {
	return fake(generate);
	function* generate() {
		for (const value of take(i, seq())) yield value;
	}
});

test('args() when FAKE()*', function () {
	const { FAKE, args } = fake();
	assert.equal(args(), []);
	FAKE();
	assert.equal(args(), [[]]);
	FAKE();
	assert.equal(args(), [[], []]);
	FAKE();
	assert.equal(args(), [[], [], []]);
	FAKE();
	assert.equal(args(), [[], [], [], []]);
	FAKE();
	assert.equal(args(), [[], [], [], [], []]);
});

test('args() when FAKE(i++)*;', function () {
	const { FAKE, args } = fake();
	assert.equal(args(), []);
	FAKE(1);
	assert.equal(args(), [[1]]);
	FAKE(2);
	assert.equal(args(), [[2], [1]]);
	FAKE(3);
	assert.equal(args(), [[3], [2], [1]]);
	FAKE(4);
	assert.equal(args(), [[4], [3], [2], [1]]);
	FAKE(5);
	assert.equal(args(), [[5], [4], [3], [2], [1]]);
});

function testThrows(description, invoke) {
	test(`FAKE() throws when fake() is given ${description}`, function () {
		const { FAKE } = invoke('message');
		assert.throws(thunk(FAKE), 'message');
	});
}
testThrows('a function that throws', function (message) {
	return fake(thrower);
	function thrower() {
		throw message;
	}
});
testThrows('a generator function that throws', function (message) {
	return fake(thrower);
	function* thrower() {
		throw message;
	}
});

test.run();
