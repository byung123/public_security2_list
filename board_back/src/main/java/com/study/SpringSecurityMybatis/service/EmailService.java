package com.study.SpringSecurityMybatis.service;

import com.study.SpringSecurityMybatis.controller.AuthenticationController;
import com.study.SpringSecurityMybatis.dto.request.ReqSendMailDto;
import com.study.SpringSecurityMybatis.entity.User;
import com.study.SpringSecurityMybatis.repository.UserMapper;
import com.study.SpringSecurityMybatis.security.jwt.JwtProvider;
import io.jsonwebtoken.Claims;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Autowired
    private JavaMailSender javaMailSender;
    @Autowired
    private AuthenticationController authenticationController;
    @Autowired
    private JwtProvider jwtProvider;
    @Autowired
    private UserMapper userMapper;


//    public Boolean send(ReqSendMailDto dto) {
//
//        MimeMessage message = javaMailSender.createMimeMessage();
//        // 두번째 인자 : multipart(이메일 안에서 파일 데이터 전송 등을 가능하게 해주는 것?) - 할 필요 없어서 false로 둠
//        try {
//            MimeMessageHelper helper = new MimeMessageHelper(message, false, "utf-8");
//            // 전송하는 사람의 메일
//            helper.setFrom(fromEmail); // gmail 형식으로 해야 뭘 할 수 있다고 하심
//            // 받는 사람의 메일
//            helper.setTo(dto.getToEmail());
//            // 메일의 제목
//            helper.setSubject(dto.getSubject());
//            StringBuilder htmlContent = new StringBuilder();
//            htmlContent.append("<div style='display:flex;justify-content:center;align-items:center;" +
//                    "flex-direction:column;width:400px'>");
//            htmlContent.append(dto.getContent());
//            htmlContent.append("<a href='http://localhost:3000'>메인화면으로 이동</a>");
////            htmlContent.append("<a href='http://localhost:8080/auth/email?token'>메인화면으로 이동</a>");
//            htmlContent.append("</div>");
//
//
//            // 메일의 내용
////            message.setText("<div></div>", "utf-8", "html");
//            message.setText(htmlContent.toString(), "utf-8", "html");
//
//        } catch (Exception e) {
//            e.printStackTrace();
//            return false;
//        }
//
//        javaMailSender.send(message);
//        return true;
//    }

    public Boolean send(String toEmail, String fromMail, String subject, String content) {

        MimeMessage message = javaMailSender.createMimeMessage();
        // 두번째 인자 : multipart(이메일 안에서 파일 데이터 전송 등을 가능하게 해주는 것?) - 할 필요 없어서 false로 둠
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "utf-8");
            // 전송하는 사람의 메일
            helper.setFrom(fromMail); // gmail 형식으로 해야 뭘 할 수 있다고 하심
            // 받는 사람의 메일
            helper.setTo(toEmail);
            // 메일의 제목
            helper.setSubject(subject);

            // 메일의 내용
//            message.setText("<div></div>", "utf-8", "html");
            message.setText(content, "utf-8", "html");

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }

        javaMailSender.send(message);
        return true;
    }

    // 이메일 보내주는 형식이 같아서 그냥 메서드로 뺴줌
    public Boolean sendTestMail(ReqSendMailDto dto) {
        StringBuilder htmlContent = new StringBuilder();
        htmlContent.append("<div style='display:flex;justify-content:center;align-items:center;" +
                "flex-direction:column;width:400px'>");
        htmlContent.append(dto.getContent());
        htmlContent.append("<a href='http://localhost:3000'>메인화면으로 이동</a>");
        htmlContent.append("</div>");

        return send(dto.getToEmail(), fromEmail, dto.getSubject(), htmlContent.toString());
    }

    public Boolean sendAuthMail(String toEmail, String username) {
        StringBuilder htmlContent = new StringBuilder();
        htmlContent.append("<div style='display:flex;justify-content:center;align-items:center;" +
                "flex-direction:column;width:400px'>");
        htmlContent.append("<h2>회원가입을 완료하시려면 아래의 인증하기 버튼을 클릭하세요.</h2>");
        // accessToken을 넣기 위해 중간 부분을 잘라줌
        // target:_blank' - 화면에 새창을 띄어주겠다는 설정
        htmlContent.append("<a target='_blank' href='http://localhost:8080/auth/mail?token=");
        htmlContent.append(jwtProvider.generateEmailValidToken(username));
        htmlContent.append("'>인증하기</a>");
        htmlContent.append("</div>");

        return send(toEmail, fromEmail, "우리 사이트의 가입을 위한 인증메일입니다.", htmlContent.toString());
    }

    public String validToken(String token) {
        try {
            // 5분이 지나서 claims 꺼내다가 오류 터질 수도 잇고,
            Claims claims = jwtProvider.getClaims(token);
            String username = claims.get("username").toString();
            User user = userMapper.findByUsername(username);

            if(user == null) {
                return "notFoundUser";
            }

            // 또는 이미 통과된 토큰일 경우 할 필요가 없음
            if(user.getEmailValid() == 1) {
                return "verified";
            }
            userMapper.modifyEmailValidByUsername(username);
        } catch (Exception e) {
            return "validTokenFail";
        }
        return "success";
    }
}
