import * as rp from 'request-promise';
import * as restify from "restify";




export async function getZipCode(){
    try{
        let token = await login("blah", "blah");
        let userInfo= await getUserInfo(token);
        let zipCode = userInfo.zipCode;
        return zipCode;
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

export function getUserInfo(token: string){
    const options = {
        method: 'GET',
        uri: 'https://test.goflink.ch/api/v1/customers/me',
        headers: { Authorization: 'Bearer '+token },
        json: true // Automatically stringifies the body to JSON
    };
    return rp(options);
}
