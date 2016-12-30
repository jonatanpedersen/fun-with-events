import mochaEslint from 'mocha-eslint';

mochaEslint([
	'services',
	'test'
], {
	alwaysWarn: false
});
