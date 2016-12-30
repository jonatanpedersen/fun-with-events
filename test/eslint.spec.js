import mochaEslint from 'mocha-eslint';

mochaEslint([
	'src',
	'test'
], {
	alwaysWarn: false
});
