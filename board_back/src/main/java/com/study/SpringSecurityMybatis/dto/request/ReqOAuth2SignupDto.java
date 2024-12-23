package com.study.SpringSecurityMybatis.dto.request;

import com.study.SpringSecurityMybatis.entity.OAuth2User;
import com.study.SpringSecurityMybatis.entity.User;
import lombok.Data;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

@Data
public class ReqOAuth2SignupDto {

    @Pattern(regexp = "^[a-z0-9]{6,}$", message = "사용자이름은 6자이상의 영소문자, 숫자 조합이어야합니다.")
    private String username;
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[~!@#$%^&*?])[A-Za-z\\d~!@#$%^&*?]{8,16}$", message = "비밀번호는 8자이상의 16자 이하의 영대소문, 숫자, 특수문자(~!@#$%^&*?)를 포함해야합니다.")
    private String password;
    private String checkPassword;
    @Pattern(regexp = "^[가-힣]+$", message ="이름은 한글이어야합니다.")
    private String name;
    @NotBlank(message = "이메일은 공백일 수 없습니다")
    @Email(message = "이메일 형식이여야 합니다.")
    private String email;
    @NotBlank(message = "OAuth2 이름을 입력해주세요.")
    private String oauth2Name;
    @NotBlank(message = "제휴사명을 입력해주세요.")
    private String provider;

    public User toUserEntity(BCryptPasswordEncoder passwordEncoder) {
        return User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .name(name)
                .email(email)
                .build();
    }
}
