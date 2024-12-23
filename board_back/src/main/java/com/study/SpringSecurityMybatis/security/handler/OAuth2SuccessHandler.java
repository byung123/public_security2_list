package com.study.SpringSecurityMybatis.security.handler;

import com.study.SpringSecurityMybatis.entity.User;
import com.study.SpringSecurityMybatis.repository.UserMapper;
import com.study.SpringSecurityMybatis.security.jwt.JwtProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserMapper userMapper;
    @Autowired
    private JwtProvider jwtProvider;

    // ctrl + o해서 매개변수 3개 있는 onAuthenticationSuccess를 오버라이드 해줘야 한다
    // OAuth 로그인할 때 이쪽으로 들어오게 된다.
    // OAuth2Service에서 검증과정 거피고 DefaultOauth 생성 되면 여기가 동작
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
//        System.out.println(authentication.getName());
        DefaultOAuth2User defaultOAuth2User = (DefaultOAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = defaultOAuth2User.getAttributes();
        String oAuth2Name = attributes.get("id").toString();
        String provider = attributes.get("provider").toString();

        User user = userMapper.finByOAuth2Name(oAuth2Name);
        // user가 null 이면 회원가입이 필요한 것
        if(user == null) {
            // 강제로 페이지 이동 -> 프론트로 보내서 회원가입 시킴
            response.sendRedirect("http://localhost:3000/user/join/oauth2?oAuth2Name=" + oAuth2Name +
                    "&provider=" + provider);
            // 밑으로 내려가지 않게 -> 안해주면 실패했는데도 토큰 만들어줌
            return;
        }
        // 필터로 넘어가지 않게
//        super.onAuthenticationSuccess(request, response, authentication);

        // user가 있으면 로그인을 해줘야한다 (토큰을 만들어서 발급해줘야 한다)
        String accessToken = jwtProvider.generateAccessToken(user);
        response.sendRedirect("http://localhost:3000/user/login/oauth2?accessToken=" + accessToken);
    }
}
