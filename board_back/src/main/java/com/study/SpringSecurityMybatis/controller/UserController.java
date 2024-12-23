package com.study.SpringSecurityMybatis.controller;

import com.study.SpringSecurityMybatis.dto.request.ReqProfileImgDto;
import com.study.SpringSecurityMybatis.security.principal.PrincipalUser;
import com.study.SpringSecurityMybatis.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return ResponseEntity.ok().body(userService.getUserInfo(id));
    }

    @GetMapping("/user/me")
    public ResponseEntity<?> getUserMe() {
        PrincipalUser principalUser = (PrincipalUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return ResponseEntity.ok().body(userService.getUserInfo(principalUser.getId()));
    }

    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return ResponseEntity.ok().body(userService.deleteUser(id));
    }

    // 수정 요청에는 put과 patch가 있는데, patch는 null을 허용하지 않는 것이다.
    // 만약 null이면 기본 default 이미지로 바뀌게 한다
    @PatchMapping("/user/img")
    public ResponseEntity<?> updateProfileImg(@RequestBody ReqProfileImgDto dto) {
        return ResponseEntity.ok().body(userService.updateProfileImg(dto));
    }
}
