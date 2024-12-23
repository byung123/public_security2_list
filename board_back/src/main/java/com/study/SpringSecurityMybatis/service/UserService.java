package com.study.SpringSecurityMybatis.service;

import com.study.SpringSecurityMybatis.dto.request.*;
import com.study.SpringSecurityMybatis.dto.response.RespDeleteUserDto;
import com.study.SpringSecurityMybatis.dto.response.RespSigninDto;
import com.study.SpringSecurityMybatis.dto.response.RespSignupDto;
import com.study.SpringSecurityMybatis.dto.response.RespUserInfoDto;
import com.study.SpringSecurityMybatis.entity.OAuth2User;
import com.study.SpringSecurityMybatis.entity.Role;
import com.study.SpringSecurityMybatis.entity.User;
import com.study.SpringSecurityMybatis.entity.UserRoles;
import com.study.SpringSecurityMybatis.exception.DeleteUserException;
import com.study.SpringSecurityMybatis.exception.EmailValidException;
import com.study.SpringSecurityMybatis.exception.SignupException;
import com.study.SpringSecurityMybatis.repository.OAuth2UserMapper;
import com.study.SpringSecurityMybatis.repository.RoleMapper;
import com.study.SpringSecurityMybatis.repository.UserMapper;
import com.study.SpringSecurityMybatis.repository.UserRolesMapper;
import com.study.SpringSecurityMybatis.security.jwt.JwtProvider;
import com.study.SpringSecurityMybatis.security.principal.PrincipalUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Value("${user.profile.img.default}") // 야물에 있는 이미지 소스 가지고 옴
    private String defaultProfileImg;

    @Autowired
    private UserMapper userMapper;
    @Autowired
    private RoleMapper roleMapper;
    @Autowired
    private UserRolesMapper userRolesMapper;
    @Autowired
    private OAuth2UserMapper oAuth2UserMapper;

    // dto에선 autowired가 안돼서 여기서 함
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtProvider jwtProvider;

    public Boolean isDuplicateUsername(String username) {
        // Optional객체를 만들 수 있는데 user 객체를 넣어서 만든다
        // Optional<User> 이렇게 만들어줌
        return Optional.ofNullable(userMapper.findByUsername(username)).isPresent();
//        return userMapper.findByUsername(username) != null; // 이렇게 써도 같음
    }

    // 만약 User DB엔 저장했는데 그 후 Role DB에 저장하는 과정에서 갑자기 예외가 터지면
    // 데이터가 꼬이게 되기 때문에 모든 테이블에 저장하는 일련의 과정을 '트랜잭션'이라는 한 단위로
    // 묶어줘야 하기 때문에 이 어노테이션을 달아줘서, 예외가 터졋을 때 롤백한다는 의미로
    // 어노테이션을 달아준다
    // 어차피 SignupException도 그냥 Exception을 상속 받는 거기 때무ㅡㄴ에
    @Transactional(rollbackFor = SignupException.class)
    public RespSignupDto inserUserAndRoles(ReqSignupDto dto) throws SignupException {
        User user = null;

        try {
            user = dto.toEntity(passwordEncoder);

            userMapper.save(user);

            // user = userMapper.findByUsername(dto.getUsername());
            // 이렇게 하면 userId를 가져올 수 있긴 한데 약간 별로다 이렇게 짜면 안된다 -> 다른 방법
            // .xml에 가서 <insert id="save" useGeneratedKeys="true" keyProperty="id"> 추가 해준다

            Role role = roleMapper.findByName("ROLE_USER");

            if(role == null) {
                role = Role.builder().name("ROLE_USER").build();
                roleMapper.save(role);
            }

            UserRoles userRoles = UserRoles.builder()
                    .userId(user.getId())   // 여기 문제가 생김 : user 테이블에 저장된 userId를 가져와서 저장해야하기 때문
                    // 어떻게 가져올꺼냐? 위에 설명
                    .roleId(role.getId())
                    .build();
            userRolesMapper.save(userRoles);

            user.setUserRoles(Set.of(userRoles));
        } catch (Exception e) {
            throw new SignupException("회원가입 중 오류 발생");
        }


        return RespSignupDto.builder()
                .message("가입하신 이메일 주소를 통해 인증 후 사용할 수 있습니다.")
                .user(user)
                .build();
    }

    public RespSigninDto generatedAccessToken(ReqSigninDto dto) {
        User user = checkUsernameAndPassword(dto.getUsername(), dto.getPassword());
//        jwtProvider.generateAccessToken(user);

        // 이메일 인증이 되지 않으면 토큰 발급을 안해주도록 한다. -> 필터에서 발급 받은 토큰을 취소?
        if(user.getEmailValid() != 1) {
            throw new EmailValidException(user.getEmail()); // 여기 메일로 인증을 던지게끔 예외에 email 던짐
        }

        return RespSigninDto.builder()
                .expireDate(jwtProvider.getExpireDate().toLocaleString())
                .accessToken(jwtProvider.generateAccessToken(user))
                .build();
    }

    private User checkUsernameAndPassword(String username, String password) {
        User user = userMapper.findByUsername(username);
        if(user == null) {
            throw new UsernameNotFoundException("사용자 정보를 확인하세요.");
        }

        if(!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("사용자 정보를 확인하세요.");
        }

        return user;
    }

    // user를 지우면서 useroles도 지워야한다.
    // 방법은 2가지인데, 트리거 없이 지우는 방법으로 만들겠다 -> UserRolesMapper
    @Transactional(rollbackFor = SQLException.class)
    public RespDeleteUserDto deleteUser(Long id) {
        // 유저가 있는지 없는지부터 확인하고 삭제
        User user = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        PrincipalUser principalUser = (PrincipalUser) authentication.getPrincipal();
        if(principalUser.getId() != id) {
            throw new AuthenticationServiceException("삭제 할 수 있는 권한이 없습니다..");
        }
        user = userMapper.findById(id);
        if(user == null) {
            throw new AuthenticationServiceException("해당 사용자는 존재하지 않는 사용자입니다.");
        }
        // user를 지우기 전에 하는것
        userRolesMapper.deleteByUserId(id);
        // 여기까지 지워져야 완전히 삭제
        userMapper.deleteById(id);

        return RespDeleteUserDto.builder()
                .isDeleting(true)
                .message("사용자 삭제 완료")
                .deleteUser(user)
                .build();
    }

    public RespUserInfoDto getUserInfo(Long id) {
        User user = userMapper.findById(id);
        Set<String> roles = user.getUserRoles().stream().map(
                userRole -> userRole.getRole().getName()
        ).collect(Collectors.toSet());

        return RespUserInfoDto.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .img(user.getImg())
                .roles(roles)
                .build();
    }

    public Boolean updateProfileImg(ReqProfileImgDto dto) {
        PrincipalUser principalUser = (PrincipalUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        // 이미지에 빈 값 요청이 오면 default 이미지로 바꾸겠다.
        if(dto.getImg() == null || dto.getImg().isBlank()) {
            userMapper.modifyImgById(principalUser.getId(), defaultProfileImg);
            return true;
        }
        userMapper.modifyImgById(principalUser.getId(), dto.getImg());
        return true;
    }

    public OAuth2User mergeSignin(ReqOAuth2MergeDto dto) {
        User user = checkUsernameAndPassword(dto.getUsername(), dto.getPassword());
        return OAuth2User.builder()
                .userId(user.getId())
                .oAuth2Name((dto.getOauth2Name()))
                .provider(dto.getProvider())
                .build();
    }

    @Transactional(rollbackFor = Exception.class)
    public Boolean oAuth2Signup(ReqOAuth2SignupDto dto) {
        User user = dto.toUserEntity(passwordEncoder);
        userMapper.save(user);

        OAuth2User oAuth2User = OAuth2User.builder()
                .userId(user.getId())
                .oAuth2Name(dto.getUsername())
                .provider(dto.getProvider())
                .build();
        oAuth2UserMapper.save(oAuth2User);

        Role role = roleMapper.findByName("ROLE_USER");

        if(role == null) {
            role = Role.builder().name("ROLE_USER").build();
            roleMapper.save(role);
        }

        UserRoles userRoles = UserRoles.builder()
                .userId(user.getId())
                .roleId(role.getId())
                .build();
        userRolesMapper.save(userRoles);
        user.setUserRoles(Set.of(userRoles));

        return true;
    }
}
