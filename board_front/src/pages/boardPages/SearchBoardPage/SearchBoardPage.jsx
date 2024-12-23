import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import ReactPaginate from 'react-paginate';
import { css } from '@emotion/react';
import { useQuery } from 'react-query';
import { instance } from '../../../apis/util/instance';
/** @jsxImportSource @emotion/react */

const paginateContainer = css`
    & > ul {
        list-style-type: none;
        display: flex;

    & > li {
        margin: 0px 5px;
    }

        & a {     
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0px 5px;
            border: 1px solid #dbdbdb;
            border-radius: 32px;
            padding: 0px 5px;
            min-width: 32px;
            height: 32px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;  
        }

        & .active {
            border-radius: 32px;
            background-color: #bbbbbb;
            color: #ffffff;
        }
    }
`;

// 참고
// useParams와 useSearchParams의 차이점
// 주소창(URL)에 ?를 기준으로 오른쪽 부분이 useSearchParams이고, 왼쪽 부분이 useParams이다.
// ex> localhost:3000/board/number/9?page=9
// useParams를 사용하면 ? 왼쪽에 있는 9를 들고 가고,
// useSearchParams를 사용하면 page=9라는 쿼리 스트링의 9  값을 가지고 온다

function SearchBoardPage(props) {
    const navigate = useNavigate();

    // 주소:포트/페이지URL?key=value(쿼리스트링, 파람스)
    const [ searchParams, setSearchParams ] = useSearchParams();
    const [ totalPageCount, setTotalPageCount ] = useState(1);
    // option이나 search를 설정 안하고 보내면 null로 보내는데, 문자열 null로 보내게 돼서 ?? ""를 임의로 넣어줌
    // 애초에 url에 아무 섧정 안하고 요청을 보낼때 url창은 문자열 값만 들어가기 때문에 자동으로 문자열 null로 인식하게 된다
    const [ searchValue, setSearchValue ] = useState(searchParams.get("search") ?? "");
    const [ searchOption, setSearchOption ] = useState(searchParams.get("option") ?? "all");

    const limit = 10; // 게시글 10개씩 들고옴

    const boardList = useQuery(
        // 페이지 번호가 바뀔 때마다 새로 요청 보냄
        ["boardListQuery", searchParams.get("page"), searchParams.get("option"), searchParams.get("search")],
        async () => await instance.get(`/board/search?page=${searchParams.get("page")}&limit=${limit}&search=${searchValue}&option=${searchOption}`),
        {
            retry: 0,
            // 검색을 눌렀을 때만 요청 보내게끔
            refetchOnWindowFocus: false,
            onSuccess: response => setTotalPageCount(response.data.totalCount % limit === 0 
                ? response.data.totalCount / limit 
                // 소수점이 남아있으면 pageCount 속성(옵션)에 parseInt - 1 해줘야 함
                : Math.floor(response.data.totalCount / limit) + 1 )
        }
    );

    const handlePageOnChange = (event) => {
        // 상태는 저장하기 때문에 바뀌는 부분만 래더링
        // e도 인덱스 번호를 가져오기 떄문에 + 1
        // 여기가 바뀜에 따라 위의 boardList 쿼리가 재요청함
        navigate(`/board/search?page=${event.selected + 1}&option=${searchOption}&search=${searchValue}`)
    };

    const handleSearchOptionOnChange = (e) => {
        setSearchOption(e.target.value);
    }
    
    const handleSearchInputOnChange = (e) => {
        setSearchValue(e.target.value);
    }

    const handleSearchButtonOnClick = () => {
        navigate(`/board/search?page=1&option=${searchOption}&search=${searchValue}`)
    }

    return (
        <div>
            <Link to={"/"}><h1>사이트 로고</h1></Link>
            <div>
                <select onChange={handleSearchOptionOnChange} value={searchOption} >
                    <option value="all">전체</option>
                    <option value="title">제목</option>
                    <option value="writer">작성자</option>
                </select>
                <input type="search" onChange={handleSearchInputOnChange} value={searchValue}/>
                <button onClick={handleSearchButtonOnClick}>검색</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>추천</th>
                        <th>조회</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        boardList.isLoading
                        ?
                        <></>
                        :
                        // 검색했을 때 데이터가 없을 수도 있기 때문에 ? 붙이기
                        boardList.data?.data?.boards?.map(board =>
                            <tr key={board.id} onClick={() => navigate(`/board/detail/${board.id}`)}>
                                <td>{board.id}</td>
                                <td>{board.title}</td>
                                <td>{board.writerName}</td>
                                <td>{board.likeCount}</td>
                                <td>{board.viewCount}</td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
            <div css={paginateContainer}>
                <ReactPaginate 
                    // 중간 기호
                    breakLabel="..."
                    // 이전 페이지, 다음 페이지 기호
                    previousLabel={<><IoMdArrowDropleft /></>}
                    nextLabel={<><IoMdArrowDropright /></>}
                    // 문자열로 인식 돼서 parseInt로 감싸주기
                    // pageCount={parseInt(totalPageCount) - 1} // 전체 페이지 개수 제한 - 인덱스로 설정돼있어서 -1 필요
                    pageCount={totalPageCount} // 전체 페이지 개수 제한 - 인덱스로 설정돼있어서 -1 필요
                    marginPagesDisplayed={2} // 페이지 목록의 양끝 개수를 2개로 만듦
                    pageRangeDisplayed={5} // 페이지 가운데가 5개
                    // containerClassName='pageate' // 클래스 네임을 설정해서 여기다 display flex 적용시킬거
                    // 하려고 했는데 속성이 ul이라 하지 않음, 그냥 위에 div에다가 css 속성 주자
                    activeClassName='active'
                    onPageChange={handlePageOnChange}
                    // 인덱스 번호로 인식하기 때문에 주소창에 직접 페이지 번호를 입력하고 들어갔을 때
                    // 주소창에 page=5입력하면 6으로 포커스 잡힘 -> 그래서 1빼줘야함
                    forcePage={parseInt(searchParams.get("page")) - 1}
                />
            </div>
        </div>
    );
}

export default SearchBoardPage;