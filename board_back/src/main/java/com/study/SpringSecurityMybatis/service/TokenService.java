package com.study.SpringSecurityMybatis.service;

import com.study.SpringSecurityMybatis.entity.User;
import com.study.SpringSecurityMybatis.exception.AccessTokenValidException;
import com.study.SpringSecurityMybatis.repository.UserMapper;
import com.study.SpringSecurityMybatis.security.jwt.JwtProvider;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtProvider jwtProvider;

    public Boolean isValidAccessToken(String bearerAccessToken) {
        // 필터에서 안하고 여기서 한다.
        // 실제 로그인 상태를 검증하는 거기 때문에 여기서 하는 것이 좋다
        try {
            String accessToken = jwtProvider.removeBearer(bearerAccessToken);

            Claims claims = jwtProvider.getClaims(accessToken);
            Long userId = ((Integer) claims.get("userId")).longValue();
            User user = userMapper.findById(userId);

            if(user == null) {
                throw new RuntimeException(); // 여기서 예외 발생해도 어차피 catch 쪽으로 가서 아무 내용 없어도 상관x
            }
        } catch (RuntimeException e) {
            throw new AccessTokenValidException("AccessToken 유효성 검사 실패");
        }
        return true;
    }
}
