package com.study.SpringSecurityMybatis.aspect;

import com.study.SpringSecurityMybatis.dto.request.ReqOAuth2SignupDto;
import com.study.SpringSecurityMybatis.dto.request.ReqSignupDto;
import com.study.SpringSecurityMybatis.service.UserService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;

@Aspect
@Component
public class ValidAspect {

    @Autowired
    private UserService userService;

    @Pointcut("@annotation(com.study.SpringSecurityMybatis.aspect.annotation.ValidAop)")
    public void pointCut() {}

    @Around("pointCut()")
    public Object around(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        Object[] args = proceedingJoinPoint.getArgs();
        BeanPropertyBindingResult bindingResult = null;

        for(Object arg : args) {
            if(arg.getClass() == BeanPropertyBindingResult.class) {
                bindingResult = (BeanPropertyBindingResult) arg;
                break;
            }
        }

        switch (proceedingJoinPoint.getSignature().getName()) {
            case "signup":
                for(Object arg : args) {
                    if(arg.getClass() == ReqSignupDto.class) {
                        ReqSignupDto dto = (ReqSignupDto) arg;
                        // 비밀번호 일치하지 않으면
                        if(!dto.getPassword().equals(dto.getCheckPassword())) {
                            FieldError fieldError
                                    = new FieldError("checkPassword", "checkPassword", "비밀번호가 일치하지 않습니다.");
                            bindingResult.addError(fieldError);
                        }
                        if(userService.isDuplicateUsername(dto.getUsername())) {
                            FieldError fieldError
                                    = new FieldError("username", "username", "이미 존재하는 사용자이름입니다.");
                            bindingResult.addError(fieldError);
                        }
                        break;
                    }
                }
                // 나중에 컴포넌트로 빼기
            case "oAuth2signup":
                for(Object arg : args) {
                    if(arg.getClass() == ReqOAuth2SignupDto.class) {
                        ReqOAuth2SignupDto dto = (ReqOAuth2SignupDto) arg;
                        if(!dto.getPassword().equals(dto.getCheckPassword())) {
                            FieldError fieldError
                                    = new FieldError("checkPassword", "checkPassword", "비밀번호가 일치하지 않습니다.");
                            bindingResult.addError(fieldError);
                        }
                        if(userService.isDuplicateUsername(dto.getUsername())) {
                            FieldError fieldError
                                    = new FieldError("username", "username", "이미 존재하는 사용자이름입니다.");
                            bindingResult.addError(fieldError);
                        }
                        break;
                    }
                }
        }

        if(bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getFieldErrors());
        }

        return proceedingJoinPoint.proceed();
    }
}
