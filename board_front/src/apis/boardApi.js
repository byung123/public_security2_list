import { instance } from "./util/instance"

export const boardRegisterApi = async (boardData) => {
    let responseData = {
        isSuccess: false,
        error: "",
        boardId : 0
    }
    
    // 내가 한 방식으로 오류처리를 짜면 안된다.
    // 이러면 response에 error를 받아오는 것이 아니라 await.post 자체 에러 메세지를 콘 솔 창에 띄어주기때문에
    // await에 대한 오류 응답을 받아서 처리하려면 무조건 try ~catch 또는 .then을 사용해서 처리한다
    const response = await instance.post("/board", boardData);
    // await 한곳의 오류 처리를 받으려면 try ~ catch 문을 받아야 한다.
    // await의 응답은 resolve 응답밖에 없어서??
    if(!response.isSuccess) {
        responseData = {
            isSuccess: false,
            error: response.error
        }
    }
    
    responseData = {
        isSuccess: true,
        boardId: response.data
    }

    return responseData;
}