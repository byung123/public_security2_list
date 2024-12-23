package com.study.SpringSecurityMybatis.init;

import com.study.SpringSecurityMybatis.entity.Board;
import com.study.SpringSecurityMybatis.entity.User;
import com.study.SpringSecurityMybatis.entity.UserRoles;
import com.study.SpringSecurityMybatis.repository.BoardMapper;
import com.study.SpringSecurityMybatis.repository.UserMapper;
import com.study.SpringSecurityMybatis.repository.UserRolesMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

// 컴포넌트로 등록햇다가 서버 재실행 후 다시 없앰
// 이미 DB에 넣었기 때문에 컴포넌트를 없앤 후에 다시 실행하게 되면
// 밑의 코드가 실행이 되는 것이 아니라 클래스만 생성이 되고, 밑의 run() 메서드는 실행되지 않는다.
// @Component
public class SampleDataInit implements CommandLineRunner {

    @Autowired
    private BoardMapper boardMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private UserRolesMapper userRolesMapper;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        List<User> users = new ArrayList<>();
        for(int i = 0; i < 20; i++) {
            User user = User.builder()
                    .username("user" + (i + 1))
                    .password(passwordEncoder.encode("1q2w3e4r!!AA"))
                    .name("김준" + (i + 1))
                    .email("user" + (i + 1) + "@gmail.com")
                    .build();
            userMapper.save(user);
            userRolesMapper.save(UserRoles.builder()
                            .userId(user.getId())
                            .roleId(1L)
                            .build());
            users.add(user);
        }

        Random random = new Random();

        for(int i = 0; i < 436; i++) {
            int randomIndex = random.nextInt(20);
            boardMapper.save(Board.builder()
                            .userId(users.get(randomIndex).getId())
                            .title("데스트 게시글 제목" + i)
                            .content("<p>테스트</p>")
                    .build());

        }
    }
}
