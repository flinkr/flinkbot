import * as rp from 'request-promise';
import * as restify from "restify";




export async function getToken(){
    try{
        return await login("blah", "blah");
    } catch (err){
        return err;
    }
}

export function login(email: string, password: string){
    console.log("Login Triggered");
    const options = {
        method: 'POST',
        uri: 'https://test.goflink.ch/api/v1/auth',
        body: {
            "username": "test@test.ch",
            "password": "Plokiupl1"
        },
        json: true // Automatically stringifies the body to JSON
    };
    //returns a promise
    return rp(options);
}


