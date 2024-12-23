import { instance } from "./util/instance";

// export const oauth2MergeApi = async (user) => {
//     let mergeData = {
//         isSuccess: false,
//         fieldErrors: [
//             {
//                 field: "",
//                 defaultMessage: ""
//             }
//         ]
//     }

//     try {
//         const response = await instance.post("/auth/oauth2/merge", user);
//         mergeData = {
//             isSuccess: true
//         }
//     } catch(error) {
//         const response = error.response;

//         mergeData = {
//             isSuccess: false
//         }

//         if(typeof(response.data) === 'string') {
//             mergeData['errorStatus'] = "loginError";
//             mergeData['error'] = response.data;
//         } else {
//             mergeData['errorStatus'] = "fieldError";
//             mergeData['error'] = response.data.map(fieldError => ({
//                 field: fieldError.field,
//                 defaultMessage: fieldError.defaultMessage
//             }));
//         }
//     }
//     return mergeData;
// }

// export const oauth2signupApi = async (user) => {
//     let responseData = {
//         isSuccess: false,
//         fieldErrors: [
//             {
//                 field: "",
//                 defaultMessage: ""
//             }
//         ]
//     }
//     try {
//         const response = await instance.post("/auth/oauth2/signup", user);
        
//         responseData = {
//             isSuccess: true
//         }
//     } catch(error) {
//         const response = error.response;
//         console.log(response.data);
//         const responseData = {
//             isSuccess: false
//         }

//         // responseData['error'] = response.data.map(fieldError => ({
//         //     field: fieldError.field,
//         //     defaultMessage: fieldError.defaultMessage
//         // }))
//     }
//     return responseData;
// }

export const oauth2MergeApi = async (user) => {
    let mergeData = {
        isSuceess: false,
        fieldErrors: [
            {
                field: "",
                defaultMessage: ""
            }
        ]
    }
    try {
        const response = await instance.post("/auth/oauth2/merge", user);
        mergeData = {
            isSuceess: true
        }
    } catch (error) {
        const response = error.response;
        
        mergeData = {
            isSuceess: false,
        }

        if(typeof(response.data) === 'string') {
            mergeData['errorStatus'] = "loginError";
            mergeData['error'] = response.data;
        }else {
            mergeData['errorStatus'] = "fieldError";
            mergeData['error'] = response.data.map(fieldError => ({
                field: fieldError.field, 
                defaultMessage: fieldError.defaultMessage
            }));
        }
    }

    return mergeData;
}

export const oauth2signupApi = async (user) => {
    let signupData = {
        isSuceess: false,
        ok: {
            message: "",
            user: null
        },
        fieldErrors: [
            {
                field: "",
                defaultMessage: ""
            }
        ]
    }
    try {
        const response = await instance.post("/auth/oauth2/signup", user);
        signupData = {
            isSuceess: true,
            ok: response.data,
        }
    } catch (error) {
        const response = error.response;
        signupData = {
            isSuceess: false,
            fieldErrors: response.data.map(fieldError => ({
                field: fieldError.field, 
                defaultMessage: fieldError.defaultMessage
            })),
        }
    }

    return signupData;
}