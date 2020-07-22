  
import { fanfictionClient } from "."


export const fanfictionGetUserById = async (userId:number) =>{

    try{
        let response = await fanfictionClient.get(`/users/${userId}`)
        return response.data
    } catch(e){
        console.log(e);
        console.log('we should probably handle this');   
    }
}