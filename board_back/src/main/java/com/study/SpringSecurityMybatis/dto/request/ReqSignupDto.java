package com.study.SpringSecurityMybatis.dto.request;

import com.study.SpringSecurityMybatis.entity.User;
import lombok.Data;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

@Data
public class ReqSignupDto {
    @Pattern(regexp = "^[a-z0-9]{6,}$", message = "사용자이름은 6자이상의 영소문자, 숫자 조합이어야합니다.")
    private String username;
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[~!@#$%^&*?])[A-Za-z\\d~!@#$%^&*?]{8,16}$", message = "비밀번호는 8자이상의 16자 이하의 영대소문, 숫자, 특수문자(~!@#$%^&*?)를 포함해야합니다.")
    private String password;
    private String checkPassword;
    @Pattern(regexp = "^[가-힣]+$", message ="이름은 한글이어야합니다.")
    private String name;
    @NotBlank(message = "이메일은 공백일 수 없습니다") // 값이 없으면 이 메세지가 뜰거고
    @Email(message = "이메일 형식이여야 합니다.") // 값이 있으면 이 메세지가 뜰거다
    private String email;

    public User toEntity(BCryptPasswordEncoder passwordEncoder) {
        return User.builder()
                .username(username)
//                .password(new BCryptPasswordEncoder().encode()) // 암호화 하기 위해서 항상 여기서 생성해야함
                .password(passwordEncoder.encode(password)) // 여기선 Component클래스로 등록 안돼잇기 때문에 Autowired할 수 없음
                                                            // 그래서 Service에서 Autowired 한것을 매개변수로 들고옴
                .name(name)
                .email(email)
                .build();
    }
}
