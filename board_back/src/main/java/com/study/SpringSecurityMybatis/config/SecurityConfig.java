package com.study.SpringSecurityMybatis.config;

import com.study.SpringSecurityMybatis.security.filter.JwtAccessTokenFilter;
import com.study.SpringSecurityMybatis.security.handler.AuthenticationHandler;
import com.study.SpringSecurityMybatis.security.handler.OAuth2SuccessHandler;
import com.study.SpringSecurityMybatis.service.OAuth2Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// Web이랑 Security를 따로 떼서 보는게 아니라 지금 우리가 사용하는거 자체가 WebSecurity라는 것을 쓰고싶기 때문에
// 이것을 달아야 우리가 만든 Config를 쓸 수 있다.
// 즉, 원래 WebSecurityConfigurerAdapter여기서 상속받은 Security를 쓰는게 아니라
// SecurityConfig여기서 우리가 재정의 한 것을 사용하기위해서 @EnableWebSecurity를 기입해줘야
// 우리가 쓴 것을 사용할 수 있다.
@EnableWebSecurity
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private JwtAccessTokenFilter jwtAccessTokenFilter;
    @Autowired
    private AuthenticationHandler authenticationHandler;
    @Autowired
    private OAuth2SuccessHandler oAuth2SuccessHandler;
    @Autowired
    private OAuth2Service oAuth2Service;

    // 루프 돌게 돼서 이걸 OAuth2Config를 새로 만들어서 거기다가 빈 등록하자
//    @Bean
//    public DefaultOAuth2UserService defaultOAuth2UserService() {
//        return new DefaultOAuth2UserService();
//    }

    // 라이브러리나 오버라이드 할 때 습관적으로 해야할 것
    // 리턴 자료형과 매개변수 자료형 확인 더 나아가 오버로딩으로 사용하는 것이 있느지 확인하는 습관을 가져야 한다
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        // 이런 Bulder 형태로 disable을 줄 수 있지만 지져분해져서 나눠서 쓴다.
//        http.formLogin().disable().headers().frameOptions().disable();
        http.formLogin().disable();
        http.httpBasic().disable();
        http.csrf().disable();
        http.headers().frameOptions().disable();

        // security일 때는 세션 상태를 유지 안 하도록 설정하는 것
        http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        http.cors(); // WebMvcConfig의 corsMappings를 따라가게 된다

        // service에서 필터 같은 기능들을 넣어두고, handler는 필터 역할을한다?
        // 먼저 service로 감
        http.oauth2Login() // oauth2 로그인을 사용하겠다
                .successHandler(oAuth2SuccessHandler)
                .userInfoEndpoint()// service가 성공했을 때 handler로 갈 수 있게끔 해주는 연결 장치
                .userService(oAuth2Service);

        // 예외가 터졌을 때(exceptionHandling) authentication와 관련해서 터진다면 authenticationHandler 이쪽으로 보내겠다
        // 이건 필터 쪽에서 발생한 예외임 - 거기서 authentication 관련 예외가 터졌을 때 이것을 동작시키겠다
        // exceptionControllerAdvice와 다른거임
        // exceptionControllerAdvice는 필터를 통과하고 이 안에서 예외가 발생했을 때 보내주는 매개체
        http.exceptionHandling().authenticationEntryPoint(authenticationHandler);

        http.authorizeRequests()
                .antMatchers(
                        "/auth/**",
                        "/h2-console/**"
                )
                .permitAll()
                // http 의 get요청인 경우의 board로 시작하는 모든 주소를 허용하겠다
                .antMatchers(
                        HttpMethod.GET,
                        "/board/**"
                )
                .permitAll()
                .anyRequest()
                .authenticated();

        http.addFilterBefore(jwtAccessTokenFilter, UsernamePasswordAuthenticationFilter.class);
    }
}
