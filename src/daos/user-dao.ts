import { PoolClient, QueryResult } from "pg";
import { connectionPool } from ".";

import { UserNotFoundError } from "../errors/UserNotFoundError";
import { User } from "../models/User";
import { AuthFailureError} from '../errors/AuthFailureError'
import { UserUserInputError } from "../errors/UserUserInputError";
import { UserDTOtoUserConvertor } from "../utils/UserDTO-to-User-converter";
// import { UserDTO } from "../dtos/user-dto";
// import { buildUpdateQuery } from "../utils/buildUpdateQuery";



export async function getAllUsers() {
    //first thing is declare a client
    let client: PoolClient
    try {
        //get a connection
        client = await connectionPool.connect()
        //send the query
        let results:QueryResult = await client.query(`select u."userId", u."username" , u."password" , u."email", u."firstName", u."lastName" from project1."User" u;`)
        return results.rows.map(UserDTOtoUserConvertor)//return the rows
    } catch (e) {
        //if we get an error we don't know 
        console.log(e)
        throw new Error('Unhandled Error Occured')
    } finally {
        //let the connectiopn go back to the pool
        client && client.release()
    }
}


export async function getUserById(id: number):Promise<User>{
    let client: PoolClient
    try {
        //get a connection
        client = await connectionPool.connect()
        //send the query
        let results = await client.query(`select u."userId", 
                u."username" , 
                u."password" , 
                u."email" ,
                u."firstName",
                u."lastName"
                from project1."User" u
                where u."userId" = ${id};`)// this is a parameterized query. In the query itself we use $1 to specify a parameter, then we fill in a value using an array as the second arg of the query function
                // pg library automatically sanitizes input for these params
        if(results.rowCount === 0){
            throw new Error('User Not Found')
        }
        return UserDTOtoUserConvertor(results.rows[0])//there should only ever be one row
    } catch (e) {
        if(e.message === 'User Not Found'){
            throw new UserNotFoundError()
        }
        //if we get an error we don't know 
        console.log(e)
        throw new Error('Unhandled Error Occured')
    } finally {
        //let the connectiopn go back to the pool
        client && client.release()
    }
}


//find user by username and password ( login )

export async function getUserByUsernameAndPassword(username:String, password:String):Promise<User>{
    let client: PoolClient
    try {
        //get a connection
        client = await connectionPool.connect()
        //send the query
        let results: QueryResult = await client.query(`select u."userId", 
                u."username" , 
                u."password" , 
                u."email" ,
                u."firstName",
                u."lastName" 
                from project1."User" u
                where u."username" = '${username}' and u."password" = '${password}';`)// this is a parameterized query. In the query itself we use $1 to specify a parameter, then we fill in a value using an array as the second arg of the query function
                // pg library automatically sanitizes input for these params
        if(results.rowCount === 0){
            throw new Error('User Not Found')
        }
        return UserDTOtoUserConvertor(results.rows[0])//there should only ever be one row
    } catch (e) {
        if(e.message === 'User Not Found'){
            throw new AuthFailureError()
        }
        //if we get an error we don't know 
        console.log(e)
        throw new Error('Unhandled Error Occured')
    } finally {
        //let the connectiopn go back to the pool
        client && client.release()
    }
}


// save one user
export async function saveOneUser(newUser:User):Promise<User>{
    let client:PoolClient
    try{
        client = await connectionPool.connect()
        //if you have multiple querys, you should make a transaction
        await client.query('BEGIN;')//start a transaction
        let results = await client.query(`insert into project1."User" ("username", "password","email", "firstName", "lastName")
                                            values($1,$2,$3,$4,$5) returning "userId" `,//allows you to return some values from the rows in an insert, update or delete
                                            [newUser.username, newUser.password, newUser.email, newUser.firstName, newUser.lastName])
        newUser.userId = results.rows[0].userId
        await client.query('COMMIT;')//ends transaction
        return newUser

    }catch(e){
        client && client.query('ROLLBACK;')//if a js error takes place, undo the sql
        if(e.message === 'Role Not Found'){
            throw new UserUserInputError()// role not found error
        }
        //if we get an error we don't know 
        console.log(e)
        throw new Error('Unhandled Error Occured')
    }finally{
        client && client.release();
    }
}


export async function patchUser(patchUser:User):Promise<User> 
{
    let client:PoolClient
    try{
        client = await connectionPool.connect();
        client.query('begin');
        if(patchUser.username) 
        {
            await client.query(`update project1."User" set "username" = $1 
                                where "userId" = $2;`, 
                                [patchUser.username, patchUser.userId])
        }
        if(patchUser.password)
        {
            await client.query(`update project1."User" set "password" = $1 
                                    where "userId" = $2;`, 
                                    [patchUser.password, patchUser.userId])
        }
        if(patchUser.firstName) 
        {
            await client.query(`update project1."User" set "firstName" = $1 
                                where "userId" = $2;`, 
                                [patchUser.firstName, patchUser.userId])
        }
        if(patchUser.lastName) 
        {
            await client.query(`update project1."User" set "lastName" = $1 
                                where "userId" = $2;`, 
                                [patchUser.lastName, patchUser.userId])
        }
        if(patchUser.email) 
        {
            await client.query(`update project1."User" set "email" = $1 
                                where "userId" = $2;`, 
                                [patchUser.email, patchUser.userId])
        }
       
        await client.query('COMMIT;')
        return patchUser   
    } 
    catch (e) 
    {
        client && client.query('ROLLBACK;')
        if(e.message === 'Role Not Found') 
        {
            throw new Error ('not working')
        }
        console.log(e);
        throw new Error('Unhandled Error')
    } 
    finally 
    {
        client && client.release()
    }
}