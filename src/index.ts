import express, { Request, Response, NextFunction } from 'express'
import { loggingMiddleware } from './middleware/logging-middleware'

import { sessionMiddleware } from './middleware/session-middleware'
import { BadCredentialsError } from './errors/BadCredentialsError'
import { getUserByUsernameAndPassword } from './daos/user-dao'
import { userRouter } from './routers/user-routers'
import { corsFilter } from './middleware/cors-filter'


const app = express()//we call the express function
//we get a completed application

// app .use matches every single http verb( get, post and delete and )
// if I don't specify a path, thats the same as every path ( '/' )
app.use(express.json())//this is an example of middle ware
// the idea of middle ware is to run requests through partial processing and let them move forward through our application
//express.json is a function that takes in the request - turns the body into a js object - and then we let the request go to the next function that it matches

//our custom middleware that we ant to run on all requests
app.use(loggingMiddleware)// we use use to match everything, no path to match all paths
app.use(corsFilter)

//middleware for tracking connections to our server
app.use(sessionMiddleware)


app.use('/users', userRouter)// redirect all requests on /users to the router

// app.options('/login', (req,res)=>{

// })

// an endpoint that unathenticated users can send credentials to to recieve authentication


app.post('/login', async (req:Request, res:Response, next:NextFunction)=>{
    
    let {username, password} = req.body; 
    // let username = req.body.username
    // let password = req.body.password
    // if I didn't get a usrname/password send an error and say give me both fields
    if(!username || !password){
        // make a custom http error and throw it or just send a res
        next (new BadCredentialsError())
    } else {
        try{
            let userFound = await getUserByUsernameAndPassword(username, password)
            req.session.user = userFound;// need to remeber to add their user data to the session
            // so we can use that data in other requests
            if(userFound){
                res.json(userFound)
            }else{
                res.status(400).send('Invalid Credentials')

            }
        }catch(e){
            next(e)
        }
    }
})



// the error handler we wrote that express redirects top level errors to
app.use((err, req, res, next) => {
    //if it is one of our custom errors
    if (err.statusCode) {
        // use the status code and the message for the response
        res.status(err.statusCode).send(err.message)
    } else {
        // if it wasnt one of our custom errors
        console.log(err)//log it out for us to debug
        //send a generic error response
        res.status(500).send('Oops, Something went wrong')
    }
})

app.listen(2006, () => {
    console.log('Server has started');
})