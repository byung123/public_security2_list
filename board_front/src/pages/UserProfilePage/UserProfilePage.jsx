import { css } from '@emotion/react';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import { storage } from '../../firebase/firebase';
import {v4 as uuid } from 'uuid';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import { updateProfileImgApi } from '../../apis/userApi';
/** @jsxImportSource @emotion/react */

const layout = css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 100px auto;
    width: 1000px;
`;

const imgBox = css`
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    width: 300px;
    height: 300px;
    box-shadow: 0px 0px 2px #00000088;
    cursor: pointer;
    overflow: hidden;

    & > img {
        height: 100%;
    }
`;

const progressBox = css`
    padding-top: 20px;
    width: 300px;

`;

function UserProfilePage(props) {
    // 회원 정보를 체크하기 위해서 가져옴
    const queryClient = useQueryClient();
    const userInfoState = queryClient.getQueryState("userInfoQuery"); // 안에 user 데이터 들어있음
    // snapshot의 퍼센트를 상태로 받을 것임
    const [ uploadPercent, setUploadPercent ] = useState(0);

    const handleImageChangeOnClick = () => {
        // 창에서 확인 누르면 동작
        if(window.confirm("프로필 사진을 변경하시겠습니까?")) {
            // 굳이 어딘가에 지정해서 add 할 필요없이 객체만 만들어주면 된다.
            // 클릭할 때마다 dom 객체가 만들어짐
            const fileInput = document.createElement("input");
            fileInput.setAttribute("type", "file");
            // 탐색기 창을 눌렀을 때 image파일들의 목록들만 나옴(다른 파일들은 선택 목록에 안보임)
            fileInput.setAttribute("accept", "image/*");
            fileInput.click();

            // const reader = new FileReader();
            
            // // onload : 파일을 눌러서 읽어졌을 때(readAsDataURL()) 동작함
            // reader.onload = (e) => {
            //     console.log(e.target.result)
            // }
            // reader.readAsDataURL(fileInput.files[0]);
            
            fileInput.onchange = (e) => {
                const files = Array.from(e.target.files);
                const profileImage = files[0];
                setUploadPercent(0); // uploadBytesResumable(업로드)시키기 전에 초기화

                // ref : firebase의 storage 것을 임포트해야한다
                // firebase에 storage를 export해놨음
                // ref(파일 이미지, 경로)
                // 하지만 파일 이미지의 경로에서 파일 이름이 같으면 덮어쓰여지게 된다.
                // 구글에 'uuid' 쳐보면 겹치지않게 설정하는 것이 있다
                // 현재 날짜 시각을 기준으로 만들어져서 데이터가 겹칠 일이 없다
                // 구글 react uuid v4 검색 -> npm install uuid 해주기 -> 위에 uuid라는 이름으로 임포트
                const storageRef = ref(storage
                    , `user/profile/${uuid()}_${profileImage.name}`);
                // 이러면 앞에 어떤 랜덤한 값의 uuid 값이 붙고 뒤에 실제 파일 이름이 붙여져서
                // 파일 경로가 절대 겹칠일이 없게 된다

                // storageRef경로에 profilrImage파일값을 업로드 하겠다(파이어베이스에서 스토리지 만들고 설정하면)
                // 밑의 코드로 인해 스토리지에 올라 가질 것임
                // uploadBytesResumable 이것만 해줘도 업로드가 되는데 이안에 on 설정을 하기 위해 변수로 저장
                const uploadTask = uploadBytesResumable(storageRef, profileImage);
                // 4개의 속성()이 들어감
                uploadTask.on(
                    'state_changed', // 얘는 무조건 들어감 - 상태값 - 상태가 변하는 중일 때(업로드 중일때 동작하겠다)
                    (snapshot) => { // snapshot(스샷) -> 함수형태로 들어감 // 업로드 중일 때 실행
                        // console.log(snapshot.totalBytes); // 전송되고 있는 바이트 크기
                        // console.log(snapshot.bytesTransferred); 
                        setUploadPercent(
                            Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100 // 퍼센트로 표시
                        );
                    },
                    (error) => {
                        console.log(error); // 에러 발생시 에러 동작 정의(파일 안올라갈 떄 등)
                    },
                    // (success) => { // 업로드가 성공했을 때 실행할 동작
                    //     getDownloadURL(storageRef) // 파이어베이스 안의 이미지 url을 출력함
                    //     .then(url => {
                    //         // console.log(url); // Promise 안에 url 들어가 있음
                    //         const profile = {
                    //             img: url
                    //         }
                    //     }); 
                    async (success) => { // 업로드가 성공했을 때 실행할 동작
                        const url = await getDownloadURL(storageRef) // 파이어베이스 안의 이미지 url을 출력함
                        const response = await updateProfileImgApi(url);
                        // const response = await updateProfileImgApi(""); // 빈 값 보내면 기본 프로필 이미지로 변경됨
                        // 강제로 쿼리를 만료시켜서 알아서 다시 재요청 보내게 함
                        queryClient.invalidateQueries("userInfoQuery");
                    }
                    // success 빼고 안써도 된다. 
                );
            }
        }
    }
    const handleDefaultImgChangeOnClick = async () => {
        if(window.confirm("기본이미지로 변경하시겠습니까?")) {
            await updateProfileImgApi("");
            queryClient.invalidateQueries("userInfoQuery");
        }
    }

    return (
        <div css={layout}>
            <h1>프로필</h1>
            <div css={imgBox} onClick={handleImageChangeOnClick}>
                <img src={userInfoState.data?.data.img} alt="" />
            </div>
            <div css={progressBox}>
                <Progress percent={uploadPercent} status={uploadPercent !== 100 ? "active" : "success"} />
            </div>
            <div>
                <button onClick={handleDefaultImgChangeOnClick}>기본 이미지로 변경</button>
            </div>
        </div>
    );
}

export default UserProfilePage;