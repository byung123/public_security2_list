package com.study.SpringSecurityMybatis.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;

// SecurityConfig에 빈으로 등록해서 OAuth2Service를 생성하려니 루프가 돌게 돼서 따로 만든다
@Configuration
public class OAuth2Config {

    @Bean
    public DefaultOAuth2UserService defaultOAuth2UserService() {
        return new DefaultOAuth2UserService();
    }
}
