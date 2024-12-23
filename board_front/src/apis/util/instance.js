import axios from "axios";

// 렌더링 될 때 한 번 세팅된다. - 처음엔 accessToken에 null이 들어간다.
// 처음에 한 번만 동작한다는 것 -> instance를 재 호출해야 다시 동작
export const instance = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        Authorization: localStorage.getItem("accessToken")
    }
});