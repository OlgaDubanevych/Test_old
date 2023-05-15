# Authentication with JWT Lab

## Overview
This repository explores the usage of JWT tokens to protect routes. The repository uses `jsonwebtoken` package for overall signing and verification. However, `express-jwt` is used as an example to showcase an existing middleware that exists to help verify tokens.

## Instructions - Part 1
1. Fork, and clone this repository locally. Run `npm install`
1. Install the `dotenv` package by running `npm install dotenv --save`
1. Create a file called `.env`. Add the value `PORT=4000`, where 4000 is a port number we can use for our project.
1. Change line `const PORT = 3000` to `const PORT = process.env.PORT || 3000`. `process.env` allows us to access environment variables of our operating system. A `.env` file paired with the `dotenv` package allows us to leverage the environment variables but by defining these through a file. `.env` for this project is already marked as ignored in our `.gitignore` file.
1. In `package.json` replace the dev script, e.g. `nodemon index.js` with `nodemon -r dotenv/config index.js`. This will automatically import the `dotenv` project for our entire application so we can use environment variables defined using a `.env` file.
1. Let's add `jsonwebtoken` package from npm. `npm install jsonwebtoken --save`
1. In `index.js`, let's import it `import jsonwebtoken from 'jsonwebtoken'`
1. Let's add our login route (after the `app.use(express.json())`) which will return back the token that will be used to validate if someone is known to the system:
```js
app.post('/login', (req, res) => {
    const reqUser = req.body.username
    const password = req.body.password
    // we use object destructuring, e.g. { username } to only 
    // use the username property of each object
    const userFound = users.find( ({ username }) => username === reqUser)

    if (userFound && password == userFound.password) {
        // username and password match, let's create a token
    }
    return res.status(401).json({error: "incorrect username \ password"})
})
```
9. After this line: `// username and password match, let's create a token`, add: 
```js
const token = jsonwebtoken.sign({reqUser}, process.env.JWT_SECRET, {expiresIn: '1m'}) // this creates a new token, passing in data
return res.json({token}) // we return back an object that has the token property with the value of token
```
10. You'll notice the reliance on a new environment variable, e.g. `process.env.JWT_SECRET`, in your `.env` file, add a new line with: `JWT_SECRET=somelongrandomphrasegoeshere`
1. Let's create a middleware that checks for a valid JWT. Create a folder called `lib`, within this folder, create a new folder called `middleware`, and within this folder create a new file called `jwtVerify.js` with the following contents:
```js
import jsonwebtoken from 'jsonwebtoken'

export default (req, res, next) => {
    const authHeader = req.headers['authorization']
    // Value of the authorization header is typically: "Bearer JWT", hence splitting with empty space and getting second part of the split
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) {
        return res.status(400).send({message: "token not found"})
    }
    try {
        const data = jsonwebtoken.verify(token, process.env.JWT_SECRET) // we validate the token is valid
        req.user = data // we create a new property on the request object with our own custom one
        next()
    } catch (err) { // if invalid, we send back a 401 with an error message
        console.error(err)
        return res.status(401).send({message: err.message})
    }
}
```
12. In `index.js`, let's import this middleware by adding this near the top: `import jwtVerify from './lib/middleware/jwtVerify.js'`

1. Before `app.get('/protected', (req, res) => {`, let's enable our middleware by adding the following line: `app.use(jwtVerify)`
1. Before proceeding further, please go to `Exploration` section below and try out the steps listed to understand the flow: obtain token, and then use token to access protected area.



## Exploration


To try the flow of the project:

* Make request to `GET /protected`. You will be faced with an error requiring token
* Make request to `POST /login` with `{"username": "testing@test.com", "password": "changeme"}`. Record the `token` provided in response
* Make request to `GET /protected`, but ensure using a tool such as `Postman`, set the `Authorization` header, with a `Bearer` token, with value recorded above. To do that, click on the `Authorization` tab under the address bar in postman, select `Bearer Token` in the type dropdown, and then enter the token value (this is the value of the token property you received upon the login)
* You should see a successful response with contents of your payload

## Instructions - Part 2
In this part, we will add hashing as well as using an existing middleware for JWT verification.

1. Let's install `express-jwt` by running `npm install express-jwt --save`
1. In `index.js` replace `import jwtVerify from './lib/middleware/jwtVerify.js'` with `import jwt from 'express-jwt'`
1. In `index.js` replace `app.use(jwtVerify)` with `app.use( jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}) )`
1. Try the exploration steps again - there shouldn't be any change noticeable. The key benefit here is that we no longer need to use a custom middleware, but rather an already created middleware.
1. Let's add hashing using argon2, `npm install argon2 --save`
1. In index.js, replace `changeme` with `$argon2i$v=19$m=16,t=2,p=1$WDFaSWQybFozbWtqekdwYQ$MoHaBhES1PAFaPjcjP3jbA` (this is an example of a hashed value using argon2. Online generators are available here: https://argon2.online/)
1. In index.js, let's import the `argon2` module, add the following import statement near the top: `import argon2 from 'argon2'`
1. Since the argon2's `verify` method provides a promise, we will use `async/await` methods to handle it. First change `app.post('/login', (req, res) => {` to `app.post('/login', async (req, res) => {`. Notice the addition of `async` to the previous routing function.
1. Next, change line `if (userFound && password == userFound.password) {` to `if (userFound && await argon2.verify(userFound.password, password)) {`. Here we are taking the password hash from our found user's object, and then verifying it against the password value provided in the request body.
1. Try the exploration steps again - there shouldn't be any noticeable change, but you no longer have any hardcoded plaintext passwords!

## References
[express-jwt](https://www.npmjs.com/package/express-jwt) - middleware used for verifying tokens

[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - package used for signing tokens

[JWT.io](https://jwt.io) - online tool to inspect JWTs
