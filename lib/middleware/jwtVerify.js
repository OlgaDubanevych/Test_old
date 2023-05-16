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