package com.study.SpringSecurityMybatis.service;

import com.study.SpringSecurityMybatis.dto.request.ReqOAuth2MergeDto;
import com.study.SpringSecurityMybatis.repository.OAuth2UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class OAuth2Service implements OAuth2UserService {

    @Autowired
    private DefaultOAuth2UserService defaultOAuth2UserService;

    @Autowired
    private OAuth2UserMapper oAuth2UserMapper;

    @Override // 이걸로 인해 Config에 Endpoint가 동작하면서 service에 이 메서드를 던져준다.
    // userRequest에 내가 로그인한 정보들을 가지고 있다
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        // 그냥 Config에 빈으로 등록해서 새로 생성할 필요없이 만든다
        // OAuth2UserService<OAuth2UserRequest, OAuth2User> service = new DefaultOAuth2UserService();
        // 이미 loadUser를 여기서 구현하고 있는데 여기서 새로 받아오고 있다

        // OAuth2User라는 녀석이 리턴이 돼서 온다
        OAuth2User oAuth2User = defaultOAuth2UserService.loadUser(userRequest);

        // 이렇게 하면 안돼서 switch문 사용
//        String id = oAuth2User.getName();
//
//        // response에 있는 name 값을 가지고 올것임
//        if(userRequest.getClientRegistration().getClientName().equals("Naver")) {
//            // Map으로 다운 캐스팅
//            Map<String, Object> attributes = (Map<String, Object>) oAuth2User.getAttribute("response");
//            // object니까 다운캐스팅
//            id = (String) attributes.get("id");
//        }
        Map<String, Object> attributes = oAuth2User.getAttributes();
        Map<String, Object> oAuth2Attributes = new HashMap<>();
        oAuth2Attributes.put("provider", userRequest.getClientRegistration().getClientName());

        switch (userRequest.getClientRegistration().getClientName()) {
            case "Google":
                oAuth2Attributes.put("id", attributes.get("sub").toString());
                break;
            case "Naver":
                // 네이버는 Attribue에서 response꺼내서 다시 attribute로 설정
                attributes = (Map<String, Object>) attributes.get("response");
                oAuth2Attributes.put("id", attributes.get("id").toString());
                break;
            case "Kakao":
                oAuth2Attributes.put("id", attributes.get("id").toString());
                break;
        }

//        System.out.println(userRequest.getClientRegistration());
//        System.out.println(oAuth2User.getAttributes());
//        System.out.println(oAuth2User.getAuthorities());
//        System.out.println(oAuth2User.getName());

        // oauth2 유저를 userDetails 상속 받아서 할 수도 있디만 id값만 받으면 돼서 그렇게 하지 않고
        // 인자 3개 - 권한, 속성,
        // return이 되는 순간에 principal 객체가 자동으로 만들어지고
        // 그거를 authentication 안에 자동적으로 등록된다
        // 알아서 principal안에 DefaultOAuth2User가 들어가게 된다
        return new DefaultOAuth2User(new HashSet<>(), oAuth2Attributes, "id");
    }

    // 클래스명이 동일해서 경로 표시
    public void merge(com.study.SpringSecurityMybatis.entity.OAuth2User oAuth2User) {
        oAuth2UserMapper.save(oAuth2User);
    }
}
