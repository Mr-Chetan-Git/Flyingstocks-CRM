import api from "./api";

export async function login(data){

    const response = await api.post("/login",data);

    return response.data;

}

export async function register(data){

    const response = await api.post("/register", data);

    return response.data;

}