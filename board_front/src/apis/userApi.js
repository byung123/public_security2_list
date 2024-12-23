import { instance } from "./util/instance";

export const updateProfileImgApi = async (img) => {
    let response = null;
    try {
        response = await instance.patch("/user/img", {img});
    } catch(error) {
        console.log(error);
        response = error.response
    }
    return response;
}