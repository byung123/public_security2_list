package com.study.SpringSecurityMybatis.controller;

import com.study.SpringSecurityMybatis.aspect.annotation.ValidAop;
import com.study.SpringSecurityMybatis.dto.request.*;
import com.study.SpringSecurityMybatis.entity.OAuth2User;
import com.study.SpringSecurityMybatis.exception.SignupException;
import com.study.SpringSecurityMybatis.service.OAuth2Service;
import com.study.SpringSecurityMybatis.service.TokenService;
import com.study.SpringSecurityMybatis.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@Slf4j
@RestController
public class AuthenticationController {

    @Autowired
    private UserService userService;

    @Autowired
    private OAuth2Service oAuth2Service;

    @Autowired
    private TokenService tokenService;

    @ValidAop
    @PostMapping("/auth/signup")
    // Valid 어노테이션과 BindingResult 객체는 같이 따라다녀야 한다
    // BindinResult에는 오류 메세지들을 넣을 거기 때문 (원래 오류사항들을 넣어두는 곳)
    // 정확히는 저 유효성 검사 후 결과를 넣어줌
    // 그리고 순서는 signup()호출 후 만들어지는 것이 아닌 만들어지고 signup()이 호출되는 것(매개변수가 먼저 만들어져 잇어야 호출할 수 있으니까)
    public ResponseEntity<?> signup(
            @Valid @RequestBody ReqSignupDto dto, BindingResult bindingResult) throws SignupException {

        // 비밀번호 일치하지 않으면
//        if(!dto.getPassword().equals(dto.getCheckPassword())) {
//            FieldError fieldError
//                    = new FieldError("checkPassword", "checkPassword", "비밀번호가 일치하지 않습니다.");
//            bindingResult.addError(fieldError);
//        }
//
//        if(userService.isDuplicateUsername(dto.getUsername())) {
//            FieldError fieldError
//                    = new FieldError("username", "username", "이미 존재하는 사용자이름입니다.");
//            bindingResult.addError(fieldError);
//        }
//
//        if(bindingResult.hasErrors()) {
//            return ResponseEntity.badRequest().body(bindingResult.getFieldErrors());
//        }

        log.info("{}", dto);
        return ResponseEntity.created(null).body(userService.inserUserAndRoles(dto));
    }

    @ValidAop
    @PostMapping("/auth/signin")
    public ResponseEntity<?> signin(@Valid @RequestBody ReqSigninDto dto, BindingResult bindingResult) {

        return ResponseEntity.ok().body(userService.generatedAccessToken(dto));
    }

    @ValidAop
    @PostMapping("/auth/oauth2/merge")
    public ResponseEntity<?> oAuth2merge(@Valid @RequestBody ReqOAuth2MergeDto dto, BindingResult bindingResult) {
        log.info("{}", dto);
        OAuth2User oAuth2User = userService.mergeSignin(dto);
        oAuth2Service.merge(oAuth2User);
        return ResponseEntity.ok().body(true);
    }

    @ValidAop
    @PostMapping("/auth/oauth2/signup")
    public ResponseEntity<?> oAuth2signup(@Valid @RequestBody ReqOAuth2SignupDto dto, BindingResult bindingResult) {
        return ResponseEntity.ok().body(userService.oAuth2Signup(dto));
    }

    // SecurityFilter에 걸리지 않음 (auth 주소로 시작해서) - SecurityConfig에서 antMatcher 설정
    @GetMapping("/auth/access")
    public ResponseEntity<?> access(ReqAccessDto dto) {
        // 토큰 유효성 검사
        return ResponseEntity.ok().body(tokenService.isValidAccessToken(dto.getAccessToken()));
    }
}
