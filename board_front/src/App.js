import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import IndexPage from "./pages/IndexPage/IndexPage";
import UserJoinPage from "./pages/UserJoinPage/UserJoinPage";
import UserLoginPage from "./pages/UserLoginPage/UserLoginPage";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { instance } from "./apis/util/instance";
import UserProfilePage from "./pages/UserProfilePage/UserProfilePage";
import OAuth2JoinPage from "./pages/OAuth2JoinPage/OAuth2JoinPage";
import Oauth2LoginPage from "./pages/Oauth2LoginPage/Oauth2LoginPage";
import WritePage from "./pages/boardPages/WritePage/WritePage";
import DetailPage from "./pages/boardPages/DetailPage/DetailPage";
import NumberBoardListPage from "./pages/boardPages/NumberBoardListPage/NumberBoardListPage";
import ScrollBoardListPage from "./pages/boardPages/ScrollBoardListPage/ScrollBoardListPage";
import SearchBoardPage from "./pages/boardPages/SearchBoardPage/SearchBoardPage";
import MailPge from "./pages/MailPage/MailPge";

function App() {
    // const [ refresh, setRefresh ] = useState(false);

    // index.js 에서 <BrouserRouter>를 가지고 있어야 사용할 수 있다
    const location = useLocation();
    const navigate = useNavigate();
    const [ authRefresh, setAuthRefresh ] = useState(true);
    /**
     * 페이지 이동시 Auth(로그인, 토큰) 확인 - 이 4가지를 생각하면서 로직을 짜는 것이 좋다
     * 1. index(home) 페이지를 먼저 들어가서 로그인 화면으로 이동한 경우 -> index로 이동
     * 2. 탭을 열자마자 주소창에 수동입력을 통해 로그인 페이지로 이동한 경우 -> index로 이동
     * 3. 로그인 후 사용 가능한 페이지로 들어갔을 때 로그인 페이지로 이동한 경우 -> 이전 페이지로 이동
     * 4. 로그인이 된 상태 -> 어느 페이지든 이동 가능
     */

    // 처음엔 true값이라 동작 안함
    // 주소 바뀌면 재요청 날라가게끔 해서 invalid 안쓰고 재요청 날라가게 만들어줌
    useEffect(() => {
        if(!authRefresh) {
            setAuthRefresh(true);
        }
    }, [location.pathname]);

    // useQuery는 정의만 해놓으면 처음에 알아서 한 번 작동이 된다
    // useQuery()는 {키값과, 함수와 객체(옵션)가(총 3개) 인수로 들어온다
    const accessTokenValid = useQuery(["accessTokenValidQuery" // atom 대신 키 값으로 쓸 것
        // , localStorage.getItem("accessToken") // localStorage에서 get 할때마다 작동 // 동작안해서 버림
    ], 
    async () => { // 일단 응답이 오면 무조건 동작(return이 일어남), 
        setAuthRefresh(false);
        // console.log("쿼리에서 요청"); // useEffect 전에 동작
        // setRefresh(false); // 위에 한 번 동작 후 다시 false로 바꿈
        return await instance.get("/auth/access", { // enable이 true일 때만 동작
            params: {
                accessToken: localStorage.getItem("accessToken")
            }
        });
    }, {
        //옵션 영역
        // 자주 쓰이는 것들
        // getNextPageParam -> 페이지 네이션 이용
        // refetch : 그냥 요청 자체를 다시 할거냐?
        // retry : 요청 실패했을 때 다시 요청을 날릴거냐?
        // refetchInterval : interval이 걸려져 잇으면 해당 시간마다 알아서 요청을 보내줌
        // 이 모든 것들은 enable이 true 일 때만 동작한다(switch 역할)
        // enable은 (true -> false)로 값이 바뀔 때도 동작

        // // 처음 false로 설정 돼있어서 동작 일단 안함 밑에
        // // useEffect에서 authRefresh를 true로 바꿔주면서 동작하게 된다
        // enabled: refresh, 
        enabled: authRefresh, 
        // // 다른데를 갔다 왔을 때 윈도우에 포커스 되면 리패치되는 옵션
        refetchOnWindowFocus: false,
        
        // // 처음 요청하고 그다음 요청보내지 마라(default로 총 4번 요청함)
        // // retry 토큰 인증 실패했을 때 콘솔창에 에러가 4개 나옴(총 4번 요청보냈기 때문)
        retry: 0, 

        // 요청에 대한 응답이 성공적으로 왔을때
        // onSuccess: response => { // 위에 return 값?
        //     console.log("OK 응답") // 마운트되고 OK응답 오면 동작(서버 state가 바꼈기 때문)
        //     console.log(response);
        // },
        // onError: error => {
        //     console.log("오류");
        //     console.log(error);
        // }

        // 로그인이 되어 있는 상태에서 로그인 페이지로 못들어가게 설정하는 것
        onSuccess: response => {
            const permitAllPaths = ["/user"];
            for(let permitAllPath of permitAllPaths) {
                if(location.pathname.startsWith(permitAllPath)) {
                    alert("잘못된 요청입니다.");
                    navigate("/");
                    break;
                }
            }
        },

        // error는 로그인이 안됐다는 의미
        // 403 에러 뜨면 동작
        // 로그인 안돼있을 때 프로필 이미지 경로 접근 못하게 /user/profile
        onError: error => {
            const authPaths = ["/profile"];
            // location.pathname : localhost:3000/ 뒤의 주소를 뜻함
            for(let authPath of authPaths) {
                // pathname에 authPath가 포함돼있으면 로그인페이지나 인덱스 페이지로 보내겠다
                // /profile로 시작하는 모든 경로
                // include는 /admin/profile 이런 경우에도 걸러버리기 때문에 swatrswith 사용
                if(location.pathname.startsWith(authPath)) {
                    // replace를 쓸 수도 있지만 둘의 차이는 뒤로가기 할 수 있냐 없냐 차이
                    // 그래서 HREF를 사ㅣ용
                    // navigate와의 차이 Navigate는 상태를 유지해주기 때문에 
                    // href나 location은 완전히 새로운 페이지를 랜더링 해줌
                    // 상태를 날릴 필요는 없기 때문에 href를 사용
                    // window.location.href=""
                    navigate("/user/login");
                    break;
                }
            }
        }
    });

    const userInfo = useQuery(
        ["userInfoQuery"],
        async () => {
            return await instance.get("/user/me");
        },
        {
            // 첫 번째 data는 axois(undefined일 수도 있어서 ?)
            // 두 번째 data는 true 아니면 false값을 가짐
            // 처음에 isSuccess는 false였다가, 갔다오면서 true로 바뀌면서 me 요청을 보낸다
            enabled: accessTokenValid.isSuccess && accessTokenValid.data?.data,
            retry: 0, 
            refetchOnWindowFocus: false,
            // 위에서 onSuccess 된거면 토큰이 유효한 것이니까 onSuccess가 됨
            // 토큰을 받아오면
            // onSuccess: response => {
            //     console.log(response);
            // },
            // // 토큰이 유효하지 않으면 에러
            // // 에러가 날 일이 없어서 그냥 지움 
            // onError: error => {
                
            // }
        }
    );

    // console.log(accessTokenValid.isLoading);
    // console.log(accessTokenValid.data);
    // console.log("그냥 출력");

    // // 랜더링이 최초로 일어나는 지점에서 토큰을 검사한다
    // useEffect(() => {
    //     // const accessToken = localStorage.getItem("accessToken");
    //     // if(!!accessToken) { // 토큰이 있으면
    //     //     // 과연 쓸 수 있는 토큰인지 확인(유효한지) -> 백엔드에게 넘겨줘서 검사
    //     //     setRefresh(true); // 여기서 true 되면서 위에 useQuery 한 번 방골
    //     // }
    //     console.log("Effect");
    // }, [accessTokenValid.data]);

    return (
               // isLoading - 요청을 날리고 응답이 올때까지의 시간은 로딩이다
                // 이걸 이용해서 로딩하는 동안 랜더링을 미리 시켜놓을 수 있음
                // isSuccess - 로딩 끝나고 갔다왔을 때 상태
                // loading이 true가 아니면 데이터가 왔다는 뜻이니까 밑에껄 랜더링해라
                // accessTokenValid.isLoading 
                // ? 
                //     <h1>...로딩중</h1> 
                // : 
                // accessTokenValid.isSuccess
                // ?
                    <Routes>
                        <Route path="/" element={ <IndexPage></IndexPage> } />
                        <Route path="/mail" element={<MailPge />} />
                        <Route path="/user/join" element={ <UserJoinPage></UserJoinPage> } />
                        <Route path="/user/join/oauth2" element={ <OAuth2JoinPage></OAuth2JoinPage> } />
                        <Route path="/user/login" element={ <UserLoginPage></UserLoginPage> } />
                        <Route path="/user/login/oauth2" element={ <Oauth2LoginPage></Oauth2LoginPage> } />
                        <Route path="/profile" element={<UserProfilePage></UserProfilePage>} />

                        <Route path="/board/search" element={ <SearchBoardPage /> }/>
                        <Route path="/board/number" element={ <NumberBoardListPage /> }/>
                        <Route path="/board/scroll" element={ <ScrollBoardListPage /> }/>
                        {/* 뒤의 보드아이디(변수로 지정됨)란 키 값이 바뀌면서 랜더링 된다 */}
                        <Route path="/board/detail/:boardId" element={ <DetailPage /> }/>
                        <Route path="/board/write" element={ <WritePage></WritePage> }/>

                        <Route path="/admin/*" element={ <></> } />
                        <Route path="/admin/*" element={ <h1>Not Found</h1> } />
                        <Route path="*" element={ <h1>Not Found</h1> } />
                    </Routes>
                // :
                //     <h1>페이지를 불러오는 중 오류가 발생하였습니다.</h1>
    );
}

export default App;