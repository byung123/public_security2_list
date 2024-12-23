package com.study.SpringSecurityMybatis.controller;


import com.study.SpringSecurityMybatis.exception.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.xml.bind.ValidationException;
import java.util.Map;

@RestControllerAdvice
public class ExceptionControllerAdvice {

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<?> validException(ValidException e) {
        return ResponseEntity.badRequest().body(e.getFieldErrors());
    }

    @ExceptionHandler(SignupException.class)
    public ResponseEntity<?> signupException(SignupException e) {
        // internalServerError : 500에러를 보내주는 메서드
        return ResponseEntity.internalServerError().body(e.getMessage());
    }

    // AuthenticationException.class <- 이거 security.core에 있는거로 가져가야 함
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> authenticationException(AuthenticationException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(AccessTokenValidException.class)
    public ResponseEntity<?> accessTokenValidException(AccessTokenValidException e) {
        return ResponseEntity.status(403).body(false);
    }

    @ExceptionHandler(NotFoundBoardException.class)
    public ResponseEntity<?> notFoundBoardException(NotFoundBoardException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> accessDeniedException(AccessDeniedException e) {
        return ResponseEntity.status(403).body(e.getMessage());
    }

    @ExceptionHandler(EmailValidException.class)
    public ResponseEntity<?> emailValidException(EmailValidException e) {
        return ResponseEntity.status(403).body(Map.of(
                "message", e.getMessage(),
                "email", e.getEmail()
        ));
    }
}
