  
import { fanfictionClient } from ".";


export const fanfictionGetAllUsers = async () =>{
    try{
        let response = await fanfictionClient.get('/users')
        return response.data
    }catch(e){
        console.log(e);
        console.log('We should probably handle this');
        
        
    }
}