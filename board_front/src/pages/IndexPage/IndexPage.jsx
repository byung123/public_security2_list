import { css } from '@emotion/react';
import React, { useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
/** @jsxImportSource @emotion/react */

const layput = css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 100px 300px;
`;

const header = css`
    display: flex;
    justify-content: center;
    margin-bottom: 40px;

    & > input {
        box-sizing: border-box;
        width: 50%;
        height: 50px;
        border-radius: 50px;
        padding: 10px 20px;
    }
`;

const main = css`
    display: flex;
    justify-content: space-between;
`

const leftBox = css`
    box-sizing: border-box;
    border: 2px solid #dbdbdb;
    border-radius: 10px;
    width: 64%;

    & > a {
        margin-right: 10px;
    }
`;

const rightBox = css`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 2px solid #dbdbdb;
    border-radius: 10px;
    width: 35%;
    padding: 20px;

    & > button {
        margin-bottom: 10px;
        width: 100%;
        height: 40px;
        font-size: 16px;
        font-weight: 600;
    }

    & > div {
        display: flex;
        justify-content: center;
        width: 100%;

        /* div안에 들어있는 a태그(css에서는 Link태그를 의미)중 마지막 1번째녀석이 아니면 after에 만들어서 넣어라 */
        & > a:not(:nth-last-of-type(1))::after {
            display: inline-block;
            content: "";
            margin: 0px 5px;
            height: 60%;
            border-left: 1px solid #222222;
        }
    }
`;

const userInfoBox = css`
    display: flex;
    justify-content: flex-start;
    width: 100%;
`;

const profileImgBox = css`
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    width: 64px;
    height: 64px;
    box-shadow: 0px 0px 2px #00000088;
    cursor: pointer;
    overflow: hidden;

    & > img {
        height: 100%;
    }
`;

const profileInfo = css`
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    flex-grow: 1;
    padding: 10px;

    & > button {
        box-sizing: border-box;
        border: 1px solid #dbdbdb;
        border-radius: 37px;
        padding: 5px 10px;
        height: 37px;
        background-color: #ffffff;
        color: #555555;
        font-size: 16px;
        cursor: pointer;
    }
`;

// 쉽게 말하면 axios의 응답을 전역으로 관리하는 것이 reactquery라고 볼 수 있다

function IndexPage(props) {
    const navigate = useNavigate();

    // App.js에서 왔던 useQuery에 대한 응답을 여기서 쓰겠다
    const queryClient = useQueryClient();
    // const data = queryClient.getQueryData("accessTokenValidQuery");
    // const state = queryClient.getQueryState("accessTokenValidQuery");
    const userInfoState = queryClient.getQueryState("userInfoQuery");
    const accessTokenValidState = queryClient.getQueryState("accessTokenValidQuery");
    
    // 인덱스 페이지에서 검색했을 때 바로 page 검색 주소로 가게끔 만들기
    const [ searchValue, setSearchValue ] = useState("");

    console.log(userInfoState);

    // 내가 가지고 오고싶은 쿼리의 키값을 적는다.우린 accessTokenValidQuery 
    // 중요한 점은 상위에서 데이터를 가지고 와서 사용해야 한다
    // const data = queryClient.getQueryData("accessTokenValidQuery");
    // console.log(data);
    // console.log(state);
    // 자식요소에서 부모요소의 쿼리를 새롭게 받아오고싶을 때하는 두 가지 방법(데이터가 새롭게 바뀌면 가져와야함)
    // queryClient.refetchQueries 와 queryClient.invalidateQueries가 있다
    // queryClient.refetchQueries
    // 내가 지금까지 가져왔던 쿼리를 만료시켜라 -> 그러면 자동적으로 다시 새로운 쿼리를 받아옴
    // 값을 지정해주면 해당 이름을 가진 쿼리만 만료시켜준다.
    // queryClient.invalidateQueries();
    
    const handleSearchInputOnChange = (e) => {
        setSearchValue(e.target.value);
    }

    const handleSearchInputOnKeyDown = (e) => {
        if(e.keyCode === 13) {
            navigate(`/board/search?page=1&option=all&search=${searchValue}`)
        }
    }

    const handleLoginButtonOnClick = () => {
        navigate("/user/login");
    }

    const handleLogoutButtonOnClick = () => {
        localStorage.removeItem("accessToken");
        window.location.replace("/");
    }

    return (
        <div css={layput}>
            <header css={header}>
                <input 
                type="search" 
                onChange={handleSearchInputOnChange} 
                onKeyDown={handleSearchInputOnKeyDown}
                placeholder='검색어를 입력해 주세요.'/>
            </header>

            <main css={main}>
                <div css={leftBox}>
                    <Link to={"/board/number?page=1"}>게시글 번호</Link>
                    <Link to={"/board/scroll"}>게시글 스크롤</Link>
                    <Link to={"/board/search?page=1"}>게시글 검색</Link>
                    <Link to={"/board/write"}>글쓰기</Link>
                    <Link to={"/mail"}>메일전송</Link>
                </div>
                {
                    accessTokenValidState.status !== "success"
                    ?
                        accessTokenValidState.status !== "error" // success와 error가 아니면 -> idle이거나 loading 중이라는 뜻
                        ?
                        <></>
                        :
                        <div css={rightBox}>
                            <p>더 안전하고 편리하게 이용하세요</p>
                            <button onClick={handleLoginButtonOnClick}>로그인</button>
                            <div>
                                <Link to={"/user/help/id"}>아이디 찾기</Link>
                                <Link to={"/user/help/pw"}>비밀번호 찾기</Link>
                                <Link to={"/user/join"}>회원가입</Link>
                            </div>
                        </div>
                    :
                    <div css={rightBox}>
                        <div css={userInfoBox}>
                            <div css={profileImgBox} onClick={() => navigate("/profile")}>
                                <img src={userInfoState.data?.data.img} alt="" />
                            </div>
                            <div css={profileInfo}>
                                <div>
                                    <div>{userInfoState.data?.data.username}님</div>
                                    <div>{userInfoState.data?.data.email}</div>
                                </div>
                                <button onClick={handleLogoutButtonOnClick}>로그아웃</button>
                            </div>
                        </div>
                    </div>
                }
            </main> 
        </div>
    );
}

export default IndexPage;