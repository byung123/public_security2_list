package com.study.SpringSecurityMybatis.controller;

import com.study.SpringSecurityMybatis.dto.request.ReqSendMailDto;
import com.study.SpringSecurityMybatis.service.EmailService;
import lombok.ToString;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

@RestController
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/email")
    public ResponseEntity<?> sendEmail(@RequestBody ReqSendMailDto dto) {
        // 줄바꿈 하고 엔터 치면 자동완성 문구가 나타남 -> tab 치면 자동완성
        return ResponseEntity.ok().body(emailService.sendTestMail(dto));
    }

    @PostMapping("/auth/mail")
    public ResponseEntity<?> sendAuthEmail(@RequestBody Map<String, Object> dto) {
//        System.out.println(dto);
        return ResponseEntity.ok().body(emailService.sendAuthMail(
                dto.get("toEmail").toString(),
                dto.get("username").toString()
        ));
    }

    // 이걸 그냥 emailValidController에 따로 만들어서 ResponseBody 말고 html 형식으로 응답 보내줄거임
    // 다시 안한다 하시고 여기 만듦
    @GetMapping("/auth/mail")
    public void emailValid(@RequestParam String token, HttpServletResponse response) throws IOException {
//        System.out.println(token);
        response.setContentType("text/html;charset=utf-8");
        switch(emailService.validToken(token)) {
            // 2가지 경우에 해당 명령문 실행
            case "validTokenFail":
            case "notFoundUser":
                response.getWriter().println(errorView("유효하지 않은 인증 요청입니다."));
                break;
                // return 해서 break 없어도 됨
            case "verified":
                response.getWriter().println(errorView("이미 인증 완료된 계정입니다."));
                break;
            case "success":
                response.getWriter().println(successView());
        }
    }

    private String successView() {
        StringBuilder sb = new StringBuilder();

        sb.append("<html>");
        sb.append("<body>");
        sb.append("<script>");
        sb.append("alert('인증이 완료되었습니다.');");
        sb.append("window.location.replace('http://localhost:3000/user/login');");
        sb.append("</script>");
        sb.append("</body>");
        sb.append("</html>");

        return sb.toString();
    }

    private String errorView(String message) {
        StringBuilder sb = new StringBuilder();

        sb.append("<html>");
        sb.append("<body>");
        sb.append("<div style=\"text-align:center;\">");
        sb.append("<h2>");
        sb.append(message);
        sb.append("</h2>");
        // onclick 소문자로 해야함
        sb.append("<button onclick='window.close()'>닫기</button>");
        sb.append("</div>");
        sb.append("</body>");
        sb.append("</html>");

        return sb.toString();
    }
}
