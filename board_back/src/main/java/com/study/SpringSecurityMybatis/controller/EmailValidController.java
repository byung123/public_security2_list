package com.study.SpringSecurityMybatis.controller;

import com.study.SpringSecurityMybatis.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletResponse;

@Controller
public class EmailValidController {

    @Autowired
    private EmailService emailService;

    // 갑자기 다시 안한다 하심 - 타임리프 안쓰신다하셔서
//    @GetMapping("/auth/mail")
//    public String emailValid(@RequestParam String token, HttpServletResponse response) {
//
//    }
}
