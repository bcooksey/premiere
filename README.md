# Premiere

[![npm version](https://img.shields.io/npm/v/premiere.svg)](https://www.npmjs.org/package/premiere)
[![Build Status](https://travis-ci.org/pedsmoreira/premiere.svg?branch=master)](https://travis-ci.org/pedsmoreira/premiere)
[![Code Climate](https://codeclimate.com/github/pedsmoreira/premiere/badges/gpa.svg)](https://codeclimate.com/github/pedsmoreira/premiere)
[![Test Coverage](https://codeclimate.com/github/pedsmoreira/premiere/badges/coverage.svg)](https://codeclimate.com/github/pedsmoreira/premiere/coverage)

Javascript ORM for consuming Restful APIs.

Premiere is standalone _(independent of framework)_, so you can use it with your favorite library/framework, be it
[MobX](https://mobxjs.github.io/mobx/)
[React](https://facebook.github.io/react/),
[Angular](https://angularjs.org/),
[VueJS](https://vuejs.org/),
[jQuery](https://jquery.com/),
[Redux](http://redux.js.org/). You name it!

## Website
For a better experience, please checkout the [Website](http://pedsmoreira.github.io/premiere)

## Features
- Easy configuration
- Model normalization and denormalization
- Caching
- Foreign keys
- HTTP Header support _(frequently used with Authorization and CSRF token)_
- 100% Unit Tested
- Works nicely with [TypeScript](http://typescriptlang.org/) and ES6

## Workflow
![Workflow](assets/workflow.png)

** For more about how promises work, check out [Dave Atchley's article](http://www.datchley.name/es6-promises/)

## Installation

Using [npm](http://npmjs.com/):

```bash
$ npm install premiere --save
```

Using cdn:

```html
<script src="https://unpkg.com/premiere/dist/premiere.min.js"></script>
```

**Note:** You'll need a ES6 [polyfill](https://babeljs.io/docs/usage/polyfill/) on your build pipeline.

## Tutorials
- [Working with Models](./tutorials/model)
- [Working with Foreign Keys](./tutorials/model-fk)
- [Customizing Stores](./tutorials/store)
- [Working with Cache](./tutorials/cache)
- [APIs without Models](./tutorials/api)

## Documentation
Check out the full [Documentation](http://pedsmoreira.github.io/premiere/documentation).

## Examples
- [Book List](http://jsfiddle.net/pedsmoreira/fqLuvjr1/) _(ES6 - JSFiddle)_
- [Todo List](examples/todo) _(Typescript)_

## Projects
- [Premiere Player](https://github.com/pedsmoreira/premiere-player) _(React + MobX)_

## Motivation
Premiere is inspired by [Laravel](https://laravel.com/)
([Eloquent](https://laravel.com/docs/master/eloquent)) and
[Rails](http://rubyonrails.org/)
([Active Record](http://guides.rubyonrails.org/active_record_basics.html)).

Because of frameworks like these, building Restful APIs is a much smoother path.

The goal of Premiere is to provide the same facility and power that these libraries provide, just this time on the client side.  

## Dependencies
- [axios](https://github.com/mzabriskie/axios) for handling HTTP Requests.

## License
MIT
