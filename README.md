express-controllers
===================

This is the step needed to transform expressjs into a complete MVC framework, by adding Controller-support. No more hassling with code in your route. express-controllers automatically set up routing based on your controllers.


## Installation

    $ npm install express-controllers

## Usage
	

```js
var expressControllers = require('express-controllers');

//Your express-app
var app = express();

//Tell expressControllers to use the controllers-directory, and use bind() to set up routing.
expressControllers
			.setDirectory('/controllers')
			.bind(app);

```


