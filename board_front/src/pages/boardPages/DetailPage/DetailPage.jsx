/** @jsxImportSource @emotion/react */
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { instance } from "../../../apis/util/instance";
import { css } from "@emotion/react";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { useState } from "react";

const layout = css`
    box-sizing: border-box;
    margin: 50px auto 300px;
    width: 1100px;
`;

const header = css`
    box-sizing: border-box;
    border: 1px solid #dbdbdb;
    padding: 10px 15px;

    & > h1 {
        margin: 0;
        margin-bottom: 15px;
        font-size: 38px;
        cursor: default;
    }
`;

const titleAndLike = css`
    display: flex;
    justify-content: space-between;
    align-items: center;

    & button {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        border: none;
        background-color: #ffffff;
        cursor: pointer;

        & > svg {
            font-size: 30px;
        }
    }
`;

const boardInfoContainer = css`
    display: flex;
    justify-content: space-between;

    & span {
        margin-right: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: default;
    }

    & button {
        box-sizing: border-box;
        margin-left: 5px;
        border: 1px solid #dbdbdb;
        padding: 5px 20px;
        background-color: white;
        font-size: 12px;
        font-weight: 600;
        color: #333333;
        cursor: pointer;
        &:hover {
            background-color: #fafafa;
        }
        &:active {
            background-color: #eeeeee;
        }
    }
`;

const contentBox = css`
    box-sizing: border-box;
    margin-top: 5px;
    border: 1px solid #dbdbdb;
    padding: 0px 15px;
    // 이미지이긴 한데 이미지의 속성이 width가 아닌 이미지(크기조절을 안 한 이미지 태그)
    // 이미지 크기 설정을 했으면 안되고, 안했으면 width:100%로 하겠다
    // 작성할 때 이미지 크기 조절해서 요청을 보내면 크기를 조절한 만큼 반환돼서 온다
    & img:not(img[width]) {
        width: 100%;
    }
`;

const commentContatiner = css`
    margin-bottom: 50px;
`;

const commentWriteBox = (level) => css`
    display: flex;
    box-sizing: border-box;
    margin-top: 5px;
    margin-left: ${level * 3}%;
    height: 80px;

    & > textarea {
        flex-grow: 1;
        margin-right: 5px;
        border: 1px solid #dbdbdb;
        outline: none;
        padding: 12px 15px;
        resize: none;
    }

    & > button {
        box-sizing: border-box;
        border: 1px solid #dbdbdb;
        width: 80px;
        background-color: #ffffff;
        cursor: pointer;
    }
`;

const commentListContainer = (level) => css`
    box-sizing: border-box;
    display: flex;
    align-items: center;
    margin-left: ${level * 3}%;
    border-bottom: 1px solid #dbdbdb;
    padding: 12px 15px;

    & > div:nth-of-type(1) {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 12px;
        border: 1px solid #dbdbdb;
        border-radius: 50%;
        width: 70px;
        height: 70px;
        overflow: hidden;

        & > img {
            height: 100%;
        }
    }
`;

const commentDetail = css`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
`;

const detailHeader = css`
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px ;

    & > span:nth-of-type(1) {
        font-weight: 600;
        cursor: default;
    }
`;

const detailContent = css`
    margin-bottom: 10px;
    max-height: 50px;
    overflow-y: auto;
`;

const detailButtons = css`
    display: flex;
    justify-content: flex-end;
    width: 100%;

    & button {
        box-sizing: border-box;
        margin-left: 4px;
        border: 1px solid #dbdbdb;
        background-color: #ffffff;
        padding: 5px 10px;
        cursor: pointer;
    }
`;

function DetailPage(props) {
    const navigate = useNavigate();
    const params = useParams();
    const boardId = params.boardId;
    const queryClient = useQueryClient();
    const userInfoData = queryClient.getQueryData("userInfoQuery");

    const [ commentData, setCommentData ] = useState({
        boardId, // boardId에 넣을 값이 위의 boardId의 이름과 같기 때문에 생략 가능
        parentId: null,
        content: ""
    });

    const [ commentModifyData, setCommentModifyData ] = useState({
        commentId: 0,
        content: ""
    });

    // console.log(boardId);
    // 이렇게 boardId를 알아내면 백엔드에게 이 아디이에 대한 내용을 가져오라고 부탁할 수 있게 된다.

    // 클라이언트 state는 recoil이나, useState에서 관리하고, 서버 state는 useQuery에서 관리하겠다
    // 라는 의미에서 react-query를 사용한다. 키 값, 요청, 옵션 인자 설정
    const board = useQuery(
        ["boardQuery", boardId], // 키 값 옆에 더 쓰면, 해당 변수의 상태가 변할 때마다 이것을 실행하겠다는 의미
        async () => {
            return instance.get(`/board/${boardId}`);
        },
        {
            // enabled: ,
            refetchOnWindowFocus: false,
            retry: 0
        }
    );

    const boardLike = useQuery(
        ["boardLikeQuery"],
        async () => {
            return instance.get(`/board/${boardId}/like`);
        },
        {
            refetchOnWindowFocus: false,
            retry: 0
        }
    );

    const comments = useQuery(
        ["commentsQuery"],
        async () => {
            return await instance.get(`/board/${boardId}/comments`);
        },
        {
            retry: 0,
            //내가 잠깐 다른거 보고 온 사이에 다른 사람이 댓글 달 수도 있기 떄문에 refetchWindowFocus는 냅둠
            onSuccess: response => console.log(response)
        }
    );

    // useMutation은 get요청을 제외한, put, post, delete 요청때 사용한다.
    // useQuery 는 get 요청을 한다, useQuery도 post나 다른 요청을 할 수 있지만,
    // useQuery의 용도는 수시로 데이터를 가지고 와서 업데이트를 하는게 목적이기 때문에 보통 get요청에서만 사용
    const likeMutation = useMutation(
        async () => {
            return await instance.post(`/board/${boardId}/like`)
        },
        {
            onSuccess: response => {
                // boardLike를 다시 동작시켜라
                boardLike.refetch();
            }
        }
    );

    const dislikeMutation = useMutation(
        async () => {
            return await instance.delete(`/board/like/${boardLike.data?.data.boardLikeId}`)
        },
        {
            onSuccess: response => {
                // boardLike를 다시 동작시켜라
                boardLike.refetch();
            }
        }
    );

    const commentMutation = useMutation(
        async () => {
            return await instance.post("/board/comment", commentData);
        },
        {
            onSuccess: response => {
                alert("댓글 작성이 완료되었습니다.");
                setCommentData({
                    boardId,
                    parentId: null,
                    content: ""
                });
                comments.refetch();
            }
        }
    );

    const modifyCommentMutation = useMutation(
        async () => await instance.put(`/board/comment/${commentModifyData.commentId}`, commentModifyData),
        {
            onSuccess: response => {
                alert("댓글 수정이 완료되었습니다.");
                setCommentModifyData({
                    commentId: 0,
                    content: ""
                });
                comments.refetch();
            }
        }
    );

    const deleteCommentMutation = useMutation(
        // mutate.mutateasync()안에 매개변수로 넣어주면 여기로 와짐
        async (commentId) => await instance.delete(`/board/comment/${commentId}`),
        {
            onSuccess: response => {
                alert("댓글을 삭제하였습니다.");
                // 삭제 후의 댓글 상태 다시 가져오기
                comments.refetch();
            }
        }
    );

    const handleLikeOnClick = () => {
        if(!userInfoData?.data) {
            if(window.confirm("로그인 후 이용가능합니다. 로그인페이지로 이동하시겠습니까?")) {
                navigate("/user/login");
            }
            return;
        }
        //  비동기로 동작함, 그냥 mutate는 동기 동작
        likeMutation.mutateAsync();
    }

    const handleDisLikeOnClick = () => {    
        dislikeMutation.mutateAsync();
    }

    const handleCommentInputOnChange = (e) => {
        setCommentData(commentData => ({
            ...commentData,
            [e.target.name]: e.target.value
        }));
    }

    const handleCommentModifyInputOnChange = (e) => {
        setCommentModifyData(commentData => ({
            ...commentData,
            [e.target.name]: e.target.value
        }));
    }

    const handleCommentSubmitOnClick = () => {
        if(!userInfoData?.data) {
            if(window.confirm("로그인 후 이용가능합니다. 로그인페이지로 이동하시겠습니까?")) {
                navigate("/user/login");
            }
            return;
        }
        commentMutation.mutateAsync();
    }
    
    const handleCommentModifySubmitOnClick = () => {
        modifyCommentMutation.mutateAsync();
    }

    // 답글이 여러개 잇는데 그 중에서 기존에 있던 상태 값의 id와 값이 다를때만 창을 띄어주게끔
    const handleReplyButtonOnClick = (commentId) => {
        // 작성하다 다른 답글 버튼 눌렀을 때 초기화
        setCommentData(commentData => ({
            boardId,
            parentId: commentId === commentData.parentId ? null : commentId,
            content: ""
        }));
        // // 답글 버튼 누를 때마다 parentId 값도 바뀌게
        // setCommentData(commentData => ({
        //     ...commentData,
            
        // }));
        setCommentModifyData(commentData => ({
            commentId: 0
        }));
    }

    const handleModifyCommentButtonOnClick = (commentId, content) => {
        setCommentModifyData(commentData => ({
            commentId,
            content
        }));
        setCommentData(commentData => ({
            parentId: null
        }))
    }

    const handleModifyCommentCancelButtonOnClick = () => {
        setCommentModifyData(commentData => ({
            commentId: 0,
            content: ""
        }));
    }

    const handleDeleteCommentButtonOnClick = (commentId) => {
        deleteCommentMutation.mutateAsync(commentId);
        setCommentData(commentData => ({
            parentId: null
        }));
        setCommentModifyData(commentData => ({
            commentId: 0
        }))
    }

    return (
        <div css={layout}>
            <Link to={"/"}><h1>사이트 로고</h1></Link>
            {
                board.isLoading && <></>
            }
            {
                board.isError && <h1>{board.error.response.data}</h1>
            }
            {
                board.isSuccess &&
                <>
                    <div css={header}>
                        <div css={titleAndLike}>
                            <h1>{board.data.data.title}</h1>
                            <div>
                                {
                                    !!boardLike?.data?.data?.boardLikeId
                                        ?
                                        <button onClick={handleDisLikeOnClick}>
                                            <IoMdHeart />
                                        </button>
                                        :
                                        <button onClick={handleLikeOnClick}>
                                            <IoMdHeartEmpty />
                                        </button>
                                }
                            </div>
                        </div>
                        <div css={boardInfoContainer}>
                            <div>
                                <span>
                                    작성자: {board.data.data.writerUsername}
                                </span>
                                <span>
                                    조회: {board.data.data.viewCount}
                                </span>
                                <span>
                                    추천:  {boardLike?.data?.data.likeCount}
                                </span>
                            </div>
                            <div>
                                {
                                    board.data.data.writerId === userInfoData?.data.userId &&
                                    <>
                                        <button>수정</button>
                                        <button>삭제</button>
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    
                    <div css={contentBox} dangerouslySetInnerHTML={{
                            __html: board.data.data.content
                        }} >
                    </div>
                    <div css={commentContatiner}>
                        <h2>댓글 {comments?.data?.data.commentCount}</h2>
                        {/* 맨 위쪽은 margin 주면 안돼서 그냥 0넣음 */}
                        {
                            commentData.parentId === null &&
                            commentModifyData.commentId === 0 &&
                            <div css={commentWriteBox(0)}>
                                <textarea 
                                name="content"
                                onChange={handleCommentInputOnChange} 
                                value={commentData.content} 
                                placeholder="댓글을 입력하세요.">
                                </textarea>
                                <button onClick={handleCommentSubmitOnClick}>작성하기</button>
                            </div>
                        }          
                        <div>
                            {/* comments.data.data까지가 dto */}
                            {
                                comments?.data?.data.comments.map(comment =>
                                    // 프래그먼트에 key값을 줄 수가 없어서(컴포넌트가 아님), 그래서
                                    // 아래쪽까지 2개 주거나, 프래그먼트 대신 div로 묶어서 거기에다가 설정한다. 
                                    <>
                                        <div key={comment.id} css={commentListContainer(comment.level)}>
                                            <div>
                                                <img src={comment.img} alt="" />
                                            </div>
                                            <div css={commentDetail}>
                                                <div css={detailHeader}>
                                                    <span>{comment.username}</span>
                                                    {/* createDate는 String 형식으로 와서 날짜 형식으로 다시 바꿔준다. */}
                                                    <span>{new Date(comment.createDate).toLocaleString()}</span>
                                                </div>
                                                <pre css={detailContent}>{comment.content}</pre>
                                                <div css={detailButtons}>
                                                    {/* 자기 글일 때만 수정 삭제 버튼이 나오도록 */}
                                                    {
                                                        userInfoData?.data?.userId === comment.writerId &&
                                                        <div>
                                                            {
                                                                commentModifyData.commentId === comment.id
                                                                ? 
                                                                <button onClick={handleModifyCommentCancelButtonOnClick}>취소</button>
                                                                :
                                                                <button onClick={() => handleModifyCommentButtonOnClick(comment.id, comment.content)}>수정</button>
                                                            }
                                                            <button onClick={() => handleDeleteCommentButtonOnClick(comment.id)}>삭제</button>
                                                        </div>
                                                    }
                                                    {
                                                        // 대댓글을 3번째 부터는 답글을 달 수 없게끔
                                                        comment.level < 3 &&
                                                        <div>
                                                            {/* 리액트에서 많이 사용되는 형태 */}
                                                            <button onClick={() => handleReplyButtonOnClick(comment.id)}>답글</button>
                                                        </div>
                                                    }
                                                    
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            commentData.parentId === comment.id &&
                                            <div key={comment.id} css={commentWriteBox(comment.level)}>
                                                <textarea name="content" onChange={handleCommentInputOnChange} value={commentData.content} placeholder="답글을 입력하세요."></textarea>
                                                <button onClick={handleCommentSubmitOnClick}>작성하기</button>
                                            </div>
                                        }    
                                        {
                                            commentModifyData.commentId === comment.id &&
                                            <div key={comment.id} css={commentWriteBox(comment.level)}>
                                                <textarea name="content" onChange={handleCommentModifyInputOnChange} value={commentModifyData.content} placeholder="답글을 입력하세요."></textarea>
                                                <button onClick={handleCommentModifySubmitOnClick}>수정하기</button>
                                            </div>
                                        }    
                                    </>
                                )
                            }
                        </div>
                    </div>
                </>
            }
        </div>
    );
}

export default DetailPage;