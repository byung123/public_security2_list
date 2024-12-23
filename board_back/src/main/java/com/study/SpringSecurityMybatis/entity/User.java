package com.study.SpringSecurityMybatis.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.study.SpringSecurityMybatis.security.principal.PrincipalUser;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class User {

    private Long id;
    private String username;
    @JsonIgnore // JSON으로 응답될 때 무시된다
    private String password;
    private String name;
    private String email;
    private int emailValid;
    private String img;
    private Set<OAuth2User> oAuth2Users;
    private Set<UserRoles> userRoles;

    public PrincipalUser toPrincipal() {
        return PrincipalUser.builder()
                .id(id)
                .username(username)
                .password(password)
                .roles(userRoles)
                .build();
    }
}
