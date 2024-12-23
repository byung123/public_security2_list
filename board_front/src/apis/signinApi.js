import { instance } from "./util/instance";

export const signinApi = async (user) => {
    let signinData = {
        isSuccess: false,
        token: null,
        fieldErrors: [
            {
                field: "",
                defaultMessage: ""
            }
        ]
    }

    try {
        const response = await instance.post("/auth/signin", user);
        signinData = {
            isSuccess: true,
            token: response.data
        }
    } catch(error) {
        const response = error.response;

        signinData = {
            isSuccess: false
        }

        // 그냥 안함 이메일 인증 안돼있어도 일단 loginerror 상태 띄움
        // if(response.response.status === 403) {
        //     signinData['errorStatus'] = "emailError";
        //     signinData['error'] = response.data;
        //     // 여기서 return 안해주면 밑에서 또 string을 받기 때문에 여기서 바로 return 해줌
        //     return signinData;
        // }

        if(response.status === 403) {
            signinData['errorStatus'] = "validEmail";
            signinData['error'] = response.data;
            // 여기서 return 안해주면 밑에서 또 string을 받기 때문에 여기서 바로 return 해줌
            // 이녀석도 String이기 떄문 -> 그러면 밑에서 loginError로 덮어버림
            return signinData;
        }

        // 얘네는 400 에러임
        if(typeof(response.data) === 'string') {
            signinData['errorStatus'] = "loginError";
            signinData['error'] = response.data;
        } else {
            signinData['errorStatus'] = "fieldError";
            signinData['error'] = response.data.map(fieldError => ({
                field: fieldError.field,
                defaultMessage: fieldError.defaultMessage
            }));
        }
    }
    return signinData;
}