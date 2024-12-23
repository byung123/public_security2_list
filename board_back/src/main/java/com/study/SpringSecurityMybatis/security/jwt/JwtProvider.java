package com.study.SpringSecurityMybatis.security.jwt;

import com.study.SpringSecurityMybatis.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtProvider {

    private final Key key; // 무조건 있어야하는 필드변수라서 final?

    // Component로 인해 IoC에 등록해놔서 서버 실행하면 자동생성되는데 우리가 secret이라는 걸 그러면 전달해줄 수 없기 때문에
    // yml 파일에서 설정한다
    // jwtsecret.com/generate 사이트에서 무작위 토큰 생성후 복사 -> yml파일에 jwt.secret에 붙여넣기
    // @Value("${jwt.secret}") -> yml에서 들고옴
    public JwtProvider(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public Date getExpireDate() {
        return new Date(new Date().getTime() + (1000L * 60 * 60 * 24 * 30));
    }

    // 토큰은 String 자료형이니까 반환 자료형 String
    public String generateAccessToken(User user) {

        // 토큰 만들어서 리턴하기
        return Jwts.builder()
                .claim("userId", user.getId())
                .expiration(getExpireDate())
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateEmailValidToken(String username) {
        // 5분 이후에는 토큰 사용 못하게
        Date expireDate = new Date(new Date().getTime() + (1000L * 60 * 5));
        // 토큰 만들어서 리턴하기
        return Jwts.builder()
                .claim("username", username)
                .expiration(expireDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String removeBearer(String bearerToken) throws RuntimeException{
        if(bearerToken == null) {
            throw new RuntimeException();
        }
        int bearerLength = "bearer ".length();
        return bearerToken.substring(bearerLength);
    }

    public Claims getClaims(String token) {
        JwtParser jwtParser = Jwts.parser()
                .setSigningKey(key) // 여기있는 키를 가지고 파싱을 하면 된다 -> 키를 가진 파서가 만들어짐
                .build();

        // parseClaimsJws parseClaimsJwt 뒤에 알파벳 잘보기 s임
        // 해당 토큰을 변환 하고(파싱) - 페이로드만을 얻어 리턴한다(클레임 자료형)
        return jwtParser.parseClaimsJws(token).getPayload();
    }
}
