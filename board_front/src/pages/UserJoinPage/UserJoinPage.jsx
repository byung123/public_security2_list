import React, { useState } from 'react';
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Link, useNavigate } from 'react-router-dom';
import { signupApi } from '../../apis/signupApi';
import { useMutation } from 'react-query';
import { instance } from '../../apis/util/instance';

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

const joinInfoBox = css`
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

const joinButton = css`
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

function UserJoinPage(props) {
    const navigate = useNavigate();

    const [ inputUser, setInputUser ] = useState({
        username: "",
        password: "",
        checkPassword: "",
        name: "",
        email: ""
    });

    const [ fieldErrorMessages, setFieldErrorMessages ] = useState({
        username: <></>,
        password: <></>,
        checkPassword: <></>,
        name: <></>,
        email: <></>
    });

    const sendMail = useMutation(
        // 매개변수를 2개이상 못받기 때문에 비궂조 할당 방법으로 받는다
        // 첫번째 옵션은 매개변수, 두 번째 옵션은 옵션 설정?이라서ㅏ?
        // async (toEmail, username) => await instance.post("/auth/mail", {toEmail, username})

        async ({toEmail, username}) => await instance.post("/auth/mail", {toEmail, username})
    );

    const handleInputUserOnChange = (e) => {
        setInputUser(inputUser => ({
            ...inputUser,
            [e.target.name]: e.target.value
        }));
    }

    const handleJoinSubmitOnClick = async () => {
        const signupData = await signupApi(inputUser);
        // console.log(signupData);
        if(!signupData.isSuccess) {
            showFieldErrorMessage(signupData.fieldErrors);
            return;
        }

        const toEmail = signupData.ok.user.email;
        const username = signupData.ok.user.username;
        await sendMail.mutateAsync({toEmail, username});
        alert(`${signupData.ok.message}`);

        navigate("/user/login");
    }

    const showFieldErrorMessage = (fieldErrors) => {
        let EmptyFieldErrors = {
            username: <></>,
            password: <></>,
            checkPassword: <></>,
            name: <></>,
            email: <></>
        };
        
        for(let fieldError of fieldErrors) {
            EmptyFieldErrors = {
                ...EmptyFieldErrors,
                [fieldError.field]: <p>{fieldError.defaultMessage}</p>
            }
        }

        setFieldErrorMessages(EmptyFieldErrors);
    }

    return (
        <div css={layout}>
            <Link to={"/"}><h1 css={logo}>사이트 로고</h1></Link>
            <div css={joinInfoBox}>
                <div>
                    <input type="text" name='username' onChange={handleInputUserOnChange} value={inputUser.username} placeholder='아이디' />
                    {fieldErrorMessages.username}
                </div>
                <div>
                    <input type="password" name='password' onChange={handleInputUserOnChange} value={inputUser.password} placeholder='비밀번호'/>
                    {fieldErrorMessages.password}
                </div>
                <div>
                    <input type="password" name='checkPassword' onChange={handleInputUserOnChange} value={inputUser.checkPassword} placeholder='비밀번호 확인'/>
                    {fieldErrorMessages.checkPassword}
                </div>
                <div>
                    <input type="text" name='name' onChange={handleInputUserOnChange} value={inputUser.name} placeholder='성명'/>
                    {fieldErrorMessages.name}
                </div>
                <div>
                    <input type="email" name='email' onChange={handleInputUserOnChange} value={inputUser.email} placeholder='이메일주소'/>
                    {fieldErrorMessages.email}
                </div>
            </div>
            <button css={joinButton} onClick={handleJoinSubmitOnClick}>가입하기</button>
        </div>
    );
}

export default UserJoinPage;