var jwt = require('jsonwebtoken')
const JWT_SECRET = 'RentUser'  // My sign value

const fetchuser = (req,res,next)=>{
    // Get the user from the jwt token and add id to req object
    const userAuthToken = req.header('auth-token');
    if(!userAuthToken){
        res.status(401).send({message : "Please authenticate using a valid token--"})
    }

    try{
        const data = jwt.verify(userAuthToken, JWT_SECRET);
        req.user = data.user;
        next();
    }catch(err){
        res.status(401).send({
            message: " Please authenticate using a valid token-"
        });
    }
}

module.exports = fetchuser