//this index is going to be for setting up the base axios client
import axios from 'axios'
//import { lbBaseUrl } from '../../environment'


// we will use this object to send off all of the other request we make to the lightlyburning api
export const fanfictionClient = axios.create({
    baseURL:'http://localhost:2006',
    headers:{
        'Content-Type': 'application/json'
    },
    withCredentials:true
})