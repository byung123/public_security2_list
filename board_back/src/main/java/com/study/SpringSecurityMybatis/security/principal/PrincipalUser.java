package com.study.SpringSecurityMybatis.security.principal;

import com.study.SpringSecurityMybatis.entity.UserRoles;
import lombok.Builder;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Builder
@Data
public class PrincipalUser implements UserDetails {
    private Long id;
    private String username;
    private String password;
    private Set<UserRoles> roles;

//    ctrl + i
    @Override
    // Collection 안에 GrantedAuthority를 상속받은 객체형태(자료형)들이 들어올 수 있다는 뜻
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream().map(
                // roles 객체 안에 role 객체가 들어있고, 그 role 객체안에 role name을 꺼내서 담는다.(USER, ADMIN 등등)
                // 그것을 SimpleGrantedAuthority로 생성한 후 다시 Set으로 바꿔서 변환
                ur -> new SimpleGrantedAuthority(ur.getRole().getName())
        ).collect(Collectors.toSet());
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
