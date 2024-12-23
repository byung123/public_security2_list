package com.study.SpringSecurityMybatis.security.filter;

import com.study.SpringSecurityMybatis.entity.User;
import com.study.SpringSecurityMybatis.repository.UserMapper;
import com.study.SpringSecurityMybatis.security.jwt.JwtProvider;
import com.study.SpringSecurityMybatis.security.principal.PrincipalUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

@Component
public class JwtAccessTokenFilter extends GenericFilter {

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private UserMapper userMapper;

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;

        String bearerAccessToken = request.getHeader("Authorization");

        if(bearerAccessToken == null || bearerAccessToken.isBlank()) {
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }

        String accessToken = jwtProvider.removeBearer(bearerAccessToken);
        // 토큰을 복호화 했을 때 안에 잇는 정보를 담을 객체
        Claims claims = null;
        try{
            claims = jwtProvider.getClaims(accessToken);
            Long userId = ((Integer) claims.get("userId")).longValue();
            User user = userMapper.findById(userId);
            // 토큰은 유효한데 아이디를 못찾는 경우
            if (user == null) {
                throw new JwtException("해당 ID(" + userId + ")의 사용자 정보를 찾지 못했습니다.");
            }

            PrincipalUser principalUser = user.toPrincipal();

            Authentication authentication // 두 번째는 안넣어도 돼서 null 넣음
                    = new UsernamePasswordAuthenticationToken(principalUser, null, principalUser.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication); // 여끼까지 하면 필터 통과가 된다


        } catch (JwtException e) {
            e.printStackTrace();
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }

        filterChain.doFilter(servletRequest, servletResponse);
    }
}
