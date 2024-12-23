import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { instance } from '../../apis/util/instance';


function Oauth2LoginPage(props) {
    const [ serachParmas ] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = serachParmas.get("accessToken");
        // 다이렉트로 조인 페이지로 요청을 했을 때(로그인 절차 안밟으면 토큰이 없을 테니까)
        // 주소창으로 localhost:3000/oauth2/login 이거만 직접 쳤을 때? params가 없음
        if(!accessToken) {
            alert("잘못된 접근입니다.");
            navigate("/");
            return;
        }
        localStorage.setItem("accessToken", "Bearer " + accessToken);
        instance.interceptors.request.use(config => {
            config.headers["Authorization"] = localStorage.getItem("accessToken")
            return config;
        });
        navigate("/");
    }, []);


    return (
        <></>
    );
}

export default Oauth2LoginPage;