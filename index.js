import express from 'express'
import jsonwebtoken from 'jsonwebtoken'
import jwtVerify from './lib/middleware/jwtVerify.js'
const app = express()
const PORT = process.env.PORT || 3000
const users = [{ username: "testing@test.com", password: "changeme"}]

app.use(express.json())
app.post('/login', (req, res) => {
    const reqUser = req.body.username
    const password = req.body.password
    // we use object destructuring, e.g. { username } to only 
    // use the username property of each object
    const userFound = users.find( ({ username }) => username === reqUser)

    if (userFound && password == userFound.password) {
        // username and password match, let's create a token 
        const token = jsonwebtoken.sign({reqUser}, process.env.JWT_SECRET, {expiresIn: '1m'}) // this creates a new token, passing in data
        return res.json({token}) // we return back an object that has the token property with the value of token
    }
    return res.status(401).json({error: "incorrect username \ password"})
})

app.use(jwtVerify)

app.get('/protected', (req, res) => {
    res.json({message: "You made it!", user: req.user}) // notice the use of req.user, this was set in middlware
})

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`)
})
