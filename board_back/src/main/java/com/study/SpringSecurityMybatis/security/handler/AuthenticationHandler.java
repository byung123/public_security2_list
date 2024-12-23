package com.study.SpringSecurityMybatis.security.handler;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

// 403에러가 나왔을 때 처리하기 위해 만듦
@Component
public class AuthenticationHandler implements AuthenticationEntryPoint {

    // security 관련해서 AuthenticationException이 터지면 무조건 여기로 온다 SecurityConfig에서 설정
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException, ServletException {

        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(403);
        response.getWriter().println("인증 토큰이 유효하지 않습니다.");

        // 해도되고 안해도 됨
        authException.printStackTrace(); // 서버측에서도 예외가 어디서 터졌는지 메세지 확인 가능 // 응답으로 가진 않고 서버에서 보임
    }
}
