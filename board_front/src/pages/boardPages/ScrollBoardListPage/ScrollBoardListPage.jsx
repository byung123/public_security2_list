import { css } from '@emotion/react';
import React, { useEffect, useRef, useState } from 'react';
import { IoMdHeart } from 'react-icons/io';
import { useInfiniteQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import { instance } from '../../../apis/util/instance';
/** @jsxImportSource @emotion/react */

const layout = css`
    margin: 0px auto;
    width: 1030px;
`;

const cardLayout = css`
    display: flex;
    /* justify-content: space-between; // 이걸해주면 마지막에 2개 남으면 양쪽으로 붙어버리기 때문에 margin으로 설정 */
    flex-wrap: wrap;
    border-top: 3px solid #dbdbdb;
    padding: 0;
    padding-top: 50px;
    width: 100%;
    list-style-type: none;
`;

const card = css`
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    margin: 0px 0px 40px;
    width: 330px;
    height: 330px;
    box-shadow: 0px 3px 3px #00000011;
    transition: all 0.3s ease-in-out;
    cursor: pointer;
    // 가운데 녀석을 선택하게 된다
    &:nth-of-type(3n - 1) {
        margin: 0px 20px 40px;
    }

    &:hover {
        transform: translateY(-5%);
    }
`;

const cardMain = css`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
`;

const cardImg = css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 170px;
    overflow: hidden;
    background-color: #000000;

    & > img {
        width: 100%;
    }
`;

const cardContent = (isShowImg) => css`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 10px;

    & > h3 {
        margin: 0px 0px 4px;
        width: 100%;
        overflow: hidden;        // 텍스트가 길어져서 공간을 넘어가면 ... 표시
        text-overflow: ellipsis; // 텍스트가 길어져서 공간을 넘어가면 ... 표시
        white-space: nowrap;     // 줄바꿈 안하겠다까지 해줘야함
    }

    & > div {
        display: -webkit-box;
        /* flex-grow: 1; */
        /* max-height: 60px;  // 줄바꾸면서 계속 밑에껄 밀어내면서 공간을 넓히기 때문에 높이 제한 */
        overflow: hidden;   
        word-break: break-all;    // 자동 줄바꿈
        /* white-space: pre-wrap;     // div이라 자동으로 줄바꿈이 안되서  */
        -webkit-line-clamp: ${isShowImg ? 3 : 6}; // 이미지가 없으면 6줄까지 보일수 있게 설정, 이미지 있으면 3줄까지만
        /* -webkit-line-clamp: ${isShowImg ? 3 : 11}; // 줄 다보이게 그냥 설정 */
        -webkit-box-orient: vertical;
        text-overflow: ellipsis;  // 근데 끝에 ...(ellipsis)가 안먹힘 -> webkit을 이용하자

        // 내용 출력 위해 이거 추가
        & > * {
            margin: 0px;
            font-size: 16px;
            font-weight: 400;
        }
    }
`

const cardFooter = css`
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #f5f5f5;
    padding: 0px 15px;
    height: 50px;

    & > div:nth-of-type(1) {
        display: flex;
        align-items: center;
        font-weight: 600;

        & > img {
            margin-right: 5px;
            border: 1px solid #dbdbdb;
            border-radius: 50%;
            width: 20px;
            height: 20px;
        }

        & > span {
            margin-right: 8px;
            font-weight: 400;
            font-size: 14px;
            color: #999999;
        }
    }

    & > div:nth-of-type(2) {
        display: flex;
        align-items: center;
        & > span {
            line-height: 10px;
        }
    }
`;

function ScrollBoardListPage(props) {
    const navigate = useNavigate();

    const loadMoreRef = useRef(null);
    const [ totalPageCount, setTotalPageCount ] = useState(1);
    const pageRef = useRef(1);
    const limit = 50;

    // 무한 스크롤할때 사용하는 쿼리, 스크롤 할 때마다 다음페이지, 다음페이지 계속 가지고 와줌
    const boardList = useInfiniteQuery(
        ["boardScrollQuery"],
        // pageParam의 기본값으로 1을 넣억서 1번에 해당하는 것들을 가져온다.
        // 값이 숫자면 요청이 날라가고, null이거나 false등 다른것이면 요청이 알아가지 않는다.
        async ({ pageParam = 1 }) => await instance.get(`/board/list?page=${pageParam}&limit=${limit}`),
        {
            // ?? : 왼쪽의 값이 null이거나 undefined 값이면 뒤에있는 false값을 쓰고, 값이 있으면 그 값 그대로 return
            // return lastPage.nextPage ?? null
            
            // 일단 한 번 요청 갔다온것이 성공하면 동작하게 된다. 
            // allPage는 useInfiniteQuery에서 자동으로 관리해주는 것 : 스크롤 내려갈 때마다 allPage에 추가됨
            // lastPage : 현재 받은 dto 배열, allPage: 여태까지 요청 받은 모든 dto들
            // allPage : 배열이라 인덱스 값을 가지고 오기 때문에 allPage.length를 해줘야 실제 페이지 숫자와 일치하게 된다
            getNextPageParam: (lastPage, allPage) => {
                const totalPageCount = lastPage.data.totalCount % limit === 0
                    ? lastPage.data.totalCount / limit
                    : Math.floor(lastPage.data.totalCount / limit) + 1;

                console.log(totalPageCount);

                    // allPage.length - 현재페이지 수(최대 크기가 되어 있겠죠?)
                    // 만약 그 길이가 다르다는 뜻은 아직 totalPage까지 가지 않았다는 뜻
                    // 같으면 마지막 페이지까지 왔다는 뜻
                    // 즉 같지 않을 때는 현재 페이지에 + 1을 해서 더 추가시킴(totalPage까지 갈 때까지)
                    // 나ㅣ중에 null이 되면 observer가 더이상 발견 못하게 됨 -> return result값에 null 드가면
                    // 재요청이 되지 않고 그 페이지에서 멈추게 되는 것
                const result = totalPageCount !== allPage.length ? allPage.length + 1 : null;
                console.log(result);

                return result // 여기서 return되는 값은 다시 위의매개변수 pageParam의 값으로 들어간다(원래 정해져있는 라이브러리 특징)
            }
            // onSuccess: response => console.log(response) // response > page 안에 data가 들어있다.
        }
    )

    useEffect(() => {
        if(!boardList.hasNextPage || !loadMoreRef.current) {
            return;
        }
        
        const observer = new IntersectionObserver((entries) => {
            // console.log(entries); // 보면 무조건 배열 안에 들어있음
            // 발견하면 안에 isIntersecting이 true로 변하게 되는 것임
            // 발견하고 스크롤이 올라가게 되면 다시 false로 바뀜
            if(entries[0].isIntersecting) { // ref 발견하면 낚아채서 밑에꺼 nextpage 가져오라는 뜻
                // console.log("div 보임!!!");
                boardList.fetchNextPage(); // 다음 페이지 불러와라(ref 부분을 발견하면)
            }
            // threshold : 보여지는 범위에 대한 것
        }, { threshold: 1.0 }); // threshold 민감도? 어느정도 위치(범위)까지 보였을 때 동작하게끔 하는 설정

        observer.observe(loadMoreRef.current); // 맨 밑에 설정한 ref를 감시하겠다 - 실행 동작

        return () => observer.disconnect();
    }, [boardList.hasNextPage]);

    return (
        <div css={layout}>
            <Link to={"/"}><h1>사이트 로고</h1></Link>
            <ul css={cardLayout}>
                {
                    boardList.data?.pages.map(page => page.data.boards.map(board => {

                        // 이미지태그로 열리는 위치 찾아주기
                        const mainImgStartIndex = board.content.indexOf("<img");
                        // 찾으면 뜨고, 못찾으면 -1이 뜸(즉, 이미지가 없으면 -1이 뜨고, 이미지 있는 글이면 뜸)
                        console.log(mainImgStartIndex);
                        // 이미지 앞쪽에 있는 것들 먼저 자르고 나서 닫히는 태그를 찾아야함
                        // 이미지 태그 앞에 예를 들어 p태그 가 있으면 닫히는 태그 중 p를 찾을 수도 있기 때문
                        let mainImg = board.content.slice(mainImgStartIndex);
                        mainImg = mainImg.slice(0, mainImg.indexOf(">") + 1);

                        // src 앞에 "<img "를 자르기 위해 5, 뒤에 "> 2개 자르기 위해 2
                        const mainImgSrc = mainImg.slice(mainImg.indexOf("src") + 5, mainImg.length - 2);
                        
                        // 이미지가 먼저 오는 경우도 있음, 이제 p태그 내용 찾자, p태그 안에 이미지 태그가 잇어서 태그도 cotent로 출력되는 문제발생
                        // const mainContent = board.content.slice(board.content.indexOf("<p>") + 3, board.content.indexOf("</p>"));
                        
                        let mainContent = board.content;

                        // 예시 <p><img sds /></p><p>asdsa</p> 이런경우를 생각해보자
                        // 예시 <p>asdsad<img sds /></p><p>asdsa</p> 이런경우를 생각해보자
                        // 예시 <p>asdasd<p></p>asd</p><p>asdsa</p> 이런경우를 생각해보자
                        while(true) {
                            // 만약 p태그가 없을 때 무한루프 방지
                            const pIndex = mainContent.indexOf("<p>");
                            if(pIndex === -1) {
                                mainContent = ""; // p태그가 없는 경우(h태그로 감싸져 있는 경우)엔 내용을 비워주겠다.
                                break;
                            }

                            mainContent = mainContent.slice(pIndex + 3);
                            if(mainContent.indexOf("<img") !== 0) {
                                if(mainContent.includes("<img")) {
                                    mainContent = mainContent.slice(0, mainContent.indexOf("<img"));
                                }
                                mainContent = mainContent.slice(0, mainContent.indexOf("</p>"));
                                break;
                            }
                        }

                        // console.log(mainImg);
                        return (   
                            <li key={board.id} css={card} onClick={() => navigate(`/board/detail/${board.id}`)}>
                                <main css={cardMain}>
                                    {
                                        mainImgStartIndex != -1 &&
                                        <div css={cardImg}>
                                            <img src={mainImgSrc} alt="" />
                                        </div>
                                    }
                                    <div css={cardContent(mainImgStartIndex != -1)}> {/* 이미지가 있으면 true */}
                                        <h3>{board.title}</h3>
                                        {/* <div>{mainContent}</div> */}
                                        <div dangerouslySetInnerHTML={{__html: mainContent}}></div>
                                    </div>
                                </main>
                                <footer css={cardFooter}>
                                    <div>
                                        <img src={board.writerProfileImg} alt='' />
                                        <span>by</span>
                                        {board.writerName}
                                    </div>
                                    <div><IoMdHeart /><span>{board.likeCount}</span></div>
                                </footer>
                            </li>
                        )
                    }))
                }
                
            </ul>
            <div ref={loadMoreRef} ></div>
        </div>
    );
}

export default ScrollBoardListPage;