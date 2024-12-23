/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useCallback, useMemo, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import 'react-quill/dist/quill.snow.css';
import  ImageResize  from "quill-image-resize";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../../firebase/firebase";
import { v4 as uuid } from "uuid";
import { RingLoader } from "react-spinners";
import { boardRegisterApi } from "../../../apis/boardApi";
import { useNavigate } from "react-router-dom";
import { instance } from "../../../apis/util/instance";
// quill이 먼저 실행되지 않게 quill.register을 아래쪽에다 임포트 시켜야 한다
Quill.register('modules/ImageResize', ImageResize);

const layout = css`
    box-sizing: border-box;
    margin: 0 auto;
    padding-top: 30px;
    width: 1100px;
`;

const header = css`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin: 10px 0px;

    & > h1 {
        margin: 0;
    }

    & > button {
        box-sizing: border-box;
        border: 1px solid #c0c0c0;
        padding: 6px 15px;
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

const titleInput = css`
    box-sizing: border-box;
    margin-bottom: 10px;
    border: 1px solid #c0c0c0;
    outline: none;
    padding: 12px 15px;
    width: 100%;
    font-size: 16px;
    
`;

const editorLayout = css`
    box-sizing: border-box;
    margin-bottom: 42px;
    width: 100%;
    height: 700px;
`;

const loadingLayout = css`
    position: absolute;
    left: 0;
    top: 0;
    z-index: 99;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #00000033;
`;

// const toolbarOptions = [
//     [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
//     [{ 'font': [] }],
//     ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
//     // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
//     [{ 'color': [] }, { 'background': [] }, { 'align': [] }],          // dropdown with defaults from theme
//     [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
//     [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
//     ['link', 'image', 'video', 'formula'],
//     ['blockquote', 'code-block']
  
//     // [{ 'header': 1 }, { 'header': 2 }],               // custom button values
//     // [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
//     // [{ 'direction': 'rtl' }],                         // text direction
//     // ['clean']                                         // remove formatting button
// ]

function WritePage(props) {
    const navigate = useNavigate();

    const toolbarOptions = useMemo(() => [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'color': [] }, { 'background': [] }, { 'align': [] }],          // dropdown with defaults from theme
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        ['link', 'image', 'video', 'formula'],
        ['blockquote', 'code-block']
      
        // [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        // [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        // [{ 'direction': 'rtl' }],                         // text direction
        // ['clean']                                         // remove formatting button
    ], []);

    const [ board, setBoard ] = useState({
        title: "",
        content: ""
    });

    // 글을 작성하다가 내가 포커스 맞춘곳으로 이미지를 적용시키는 곳에 넣고,
    // 이미지를 지울 때 어떤 이미지를 지우는지 찾기 위해 사용
    const quillRef = useRef(null);
    const [ isUploading, setUploading ] = useState(false);

    // const handleWriteSubmitOnClick = async () => {
    //     // console.log(board);
    //     const response = await boardRegisterApi(board);
    //     console.log(response);
    //     // 응답 성공하면 페이지 이동시키기
    //     if(response.isSuccess) {
    //         alert("작성이 완료되었습니다.");
    //         navigate(`/board/detail/${response.data.boardId}`);
    //     }
    //     if(!response.isSuccess) {
    //         console.log(response.error);
    //     }
    // }

    const handleWriteSubmitOnClick = () => {
        instance.post("/board", board)
            .then((response) => {
                console.log(response.data)
                alert("작성이 완료되었습니다.");
                navigate(`/board/detail/${response.data.boardId}`);
            })
            .catch((error) => {
                const fieldErrors = error.response.data;

                for (let fieldError of fieldErrors) {
                    if (fieldError.field === "title") {
                        alert(fieldError.defaultMessage);
                        return;
                    }
                }
                for (let fieldError of fieldErrors) {
                    if (fieldError.field === "content") {
                        alert(fieldError.defaultMessage);
                        return;
                    }
                }
            });
    }

    const handleWriteSubmitOnClick2 = async () => {
        try {
            const response = await instance.post("/board", board)
            alert("작성이 완료되었습니다.");
            navigate(`/board/detail/${response.data.boardId}`);
        } catch (error) {
            const fieldErrors = error.response.data;

            for (let fieldError of fieldErrors) {
                if (fieldError.field === "title") {
                    alert(fieldError.defaultMessage);
                    return;
                }
            }
            for (let fieldError of fieldErrors) {
                if (fieldError.field === "content") {
                    alert(fieldError.defaultMessage);
                    return;
                }
            }
        }
    }

    const handleTitleInputOnChange = (e) => {
        setBoard(board => ({
            ...board,
            [e.target.name]: e.target.value
        }));
    }

    // react-quill 안에 작성하는 것이 value임
    const handleQuillValueOnChange = (value) => {
        // 이러면 안의 태그 없이 내용만 가져올 수 있다
        // console.log(quillRef.current.getEditor().getText().trim());

        setBoard(board => ({
            ...board,
            content: quillRef.current.getEditor().getText().trim() === ""?"" : value
        }));
    }

    // Quill 이라는 것은 처음 랜더링 할 때만 정의 되게끔 설정돼있다.
    // 만약 재랜더링이 일어나면 툴바가 재랜더링되면서 함수의 주소가 바뀐다.
    // 한 마디로 여기선 고정이지만 위에 함수로 정의해놓은건 랜더링 마다
    // 주소가 바뀐다. handleImageLoad함수를 useCallBack으로 묶어줘야 한다.
    const handleImageLoad = useCallback(() => {
        // 눌렀을 때 파일 선택하는 창 띄우기
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.click();

        input.onchange = () => {
            // editor 객체를 가지고 올 수 있게 해주는 메서드
            const editor = quillRef.current.getEditor();
            const files = Array.from(input.files);

            // console.log(input.files);
            // const reader = new FileReader();
            // // 함수 정의
            // reader.onload = (e) => {
            //     console.log(e.target.result);
            // }
            // // 이게 실행되면 onload 정의된것이 실행
            // reader.readAsDataURL(files[0]);
            
            const imgFile = files[0];
            // 현재 내가 위치핟고 있는 곳을 의미?
            const editPoint = editor.getSelection(true);

            const storageRef = ref(storage, `board/img/${uuid()}_${imgFile.name}`);
            // storageRef 겨ㅑㅇ로에 있는 이미지 파일을 올리겠다
            const task = uploadBytesResumable(storageRef, imgFile);
            setUploading(true);
            task.on(
                "state_changed",
                () => {},
                () => {},
                async () => {
                    const url = await getDownloadURL(storageRef);
                    // 해당 커서가 잇는 곳에 이미지를 추가해라
                    editor.insertEmbed(editPoint.index, "image", url)
                    // 그러고 나서 커서 포인트를 하나 더 많게 커서 포인터를 위치시켜라(그래야 이미지 파일 제일 끝부분으로 커서가 이동됨)
                    editor.setSelection(editPoint.index + 1);
                    // 다음줄로 넘어감
                    editor.insertText(editPoint.index + 1, "\n");
                    setUploading(false);
                    // 여기서 이걸 해줘야 빈 값으로 요청이 안날라감
                    setBoard(board => ({
                        ...board,
                        content: editor.root.innerHTML
                    }));
                }
            );
        }
    }, []);

    return (
        <div css={layout}>
            <header css={header}>
                <h1>Quill Edit</h1>
                <button onClick={handleWriteSubmitOnClick}>작성하기</button>
            </header>
            <input css={titleInput} 
            type="text" 
            name="title"
            onChange={handleTitleInputOnChange} 
            value={board.title} 
            placeholder="게시글의 제목을 입력하세요."/>
            <div css={editorLayout} >
                {
                    isUploading &&
                    <div css={loadingLayout}>
                        <RingLoader />
                    </div>
                }
                <ReactQuill 
                    ref={quillRef}
                    style={{
                        boxSizing: "border-box",
                        width: "100%",
                        height: "100%"
                    }}
                    onChange={handleQuillValueOnChange}
                    modules={{
                        toolbar: {
                            container: toolbarOptions,
                            // Quill 이라는 것은 처음 랜더링 할 때만 정의 되게끔 설정돼있다.
                            // 만약 재랜더링이 일어나면 툴바가 재랜더링되면서 함수의 주소가 바뀐다.
                            // 한 마디로 여기선 고정이지만 위에 함수로 정의해놓은건 랜더링 마다
                            // 주소가 바뀐다. handleImageLoad함수를 useCallBack으로 묶어줘야 한다.
                            // 툴바에서 눌러서 작동하는 것을 함수로 바꿔주겠다
                            handlers: {
                                image: handleImageLoad,
                            }
                        },
                        ImageResize: {
                            parchment: Quill.import("parchment"),
                        },
                        
                    }}
                />
            </div>
        </div>
    );
}

export default WritePage;