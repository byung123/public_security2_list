import { css } from '@emotion/react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signinApi } from '../../apis/signinApi';
import { instance } from '../../apis/util/instance';
/** @jsxImportSource @emotion/react */

const layout = css`
    display: flex;
    flex-direction: column;
    margin: 0px auto;
    width: 460px;
`;

const logo = css`
    font-size: 24px;
    margin-bottom: 40px;
`;

const loginInfoBox = css`
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    width: 100%;

    & input {
        box-sizing: border-box;
        border: none;
        outline: none;
        width: 100%;
        height: 50px;
        font-size: 16px;
    }

    & p {
        margin: 0px 0px 10px 10px;
        color: #ff2f2f;
        font-size: 12px;
    }

    & > div {
        box-sizing: border-box;
        width: 100%;
        border: 1px solid #dbdbdb;
        border-bottom: none;
        padding: 0px 20px;
    }

    & div:nth-of-type(1) {
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }

    & div:nth-last-of-type(1) {
        border-bottom: 1px solid #dbdbdb;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
    }
`;

const loginButton = css`
    border: none;
    border-radius: 10px;
    width: 100%;
    height: 50px;
    background-color: #999999;
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
`;

function UserLoginPage(props) {
    const navigate = useNavigate();

    const [ inputUser, setInputUser ] = useState({
        username: "",
        password: ""
    });

    const [ fieldErrorMessages, setFieldErrorMessages ] = useState({
        username: <></>,
        password: <></>
    });

    const handleInputUserOnChange = (e) => {
        setInputUser(inputUser => ({
            ...inputUser,
            [e.target.name]: e.target.value
        }));
    }

    const showFieldErrorMessage = (fieldErrors) => {
        let EmptyFieldErrors = {
            username: <></>,
            password: <></>
        };
        
        for(let fieldError of fieldErrors) {
            EmptyFieldErrors = {
                ...EmptyFieldErrors,
                [fieldError.field]: <p>{fieldError.defaultMessage}</p>
            }
        }

        setFieldErrorMessages(EmptyFieldErrors);
    }

    const handleLoginSubmitOnClick= async () => {
        const signinData = await signinApi(inputUser);
        if(!signinData.isSuccess) {
            if(signinData.errorStatus === 'fieldError') {
                showFieldErrorMessage(signinData.error);
            }
            if(signinData.errorStatus === 'loginError') {
                let EmptyFieldErrors = {
                    username: <></>,
                    password: <></>
                }; 
                setFieldErrorMessages(EmptyFieldErrors);
                alert(signinData.error);
            }
            // 회원가입은 했는데 그후 이메일 인증 토큰이 지나버렸을 때, 다시 인증메일과 토큰 발급 받게끔
            if(signinData.errorStatus === 'validEmail') {
                if(window.confirm(`${signinData.error.message}`)) {
                    const response = await instance.post("/auth/mail", {
                        toEmail: signinData.error.email,
                        username: inputUser.username
                    });
                    if(response.status === 200) {
                        alert("인증 메일을 전송하였습니다.");
                    }
                }
            }

            return;
        }
        // instance 쪽에 "Bearer"붙여도 된다.
        localStorage.setItem("accessToken", "Bearer " + signinData.token.accessToken);
        
        // 처음 accessToken 요청하고 그다음 요청을 안날리기 때문에 여기서 설정
        // request 요청때 사용할 것이다라는 뜻 안에 인수로 함수를 받음
        // 요청 때 header에 방금 로그인했을 때 새롭게 받은 값을 다시 refresh 해주겠다
        // 그다음 return config를 하면 설정이 될 것이다
        instance.interceptors.request.use(config => {
            config.headers["Authorization"] = localStorage.getItem("accessToken");
            return config;
        });

        // login했을 때 바로 profile 페이지로 이동시키기
        // useNaviget를 안씀 -> 만약 쓰게되면 상태가 유지된 채로 상태가 날라간다.
        // 하지만 replace를 하면 그냥 주소창에 엔터친것과 같다
        // 그럼 그냥 새로 렌더링 된거와 같다 -> 이것을 하는 이유는
        // window.history.length : 페이지 요청이 일어나는 횟수를 의미
        if(window.history.length > 2) { // 2이상이면 리다이렉트가 됐다는 뜻일 것
            // window.history.back(-1);
            navigate(-1); // window.href로 재랜더링 시킬 필요가 없어서 그냥 navigate 사용
            return;
        } 
        // 2가 아닌 경우 - 바로 user/login으로 들어갔을 경우 -> 뒤로 돌아갈 페이지가 없기 때문에
        // replace를 사용해서 home으로 보내버린다
        // window.location.replace("/");
        navigate("/"); // window.href로 재랜더링 시킬 필요가 없어서 그냥 navigate 사용

        // 값이 2일 때 근데 이러면 useQuery가 작동이 안돼서 로그인 상태가 안돼있다
        // 따라서 localStorage의 값이 바뀔 때마다 useQuery가 일어나게 끔 App.js에서 설정
        // accessTokenValid에 getItem할 때마다 일어나도록 추가
        // 근데 안돼서 useEffect로 설정
    }

    return (
        <div css={layout}>
            <Link to={"/"}><h1 css={logo}>사이트 로고</h1></Link>
            <div css={loginInfoBox}>
                <div>
                    <input type="text" name='username' onChange={handleInputUserOnChange} value={inputUser.username} placeholder='아이디' />
                    {fieldErrorMessages.username}
                </div>
                <div>
                    <input type="password" name='password' onChange={handleInputUserOnChange} value={inputUser.password} placeholder='비밀번호'/>
                    {fieldErrorMessages.password}
                </div>
            </div>
            <button css={loginButton} onClick={handleLoginSubmitOnClick}>로그인</button>
            <a href="http://localhost:8080/oauth2/authorization/google">구글로그인</a>
            <a href="http://localhost:8080/oauth2/authorization/naver">네이버로그인</a>
            <a href="http://localhost:8080/oauth2/authorization/kakao">카카오로그인</a>
        </div>
    );
}

export default UserLoginPage;