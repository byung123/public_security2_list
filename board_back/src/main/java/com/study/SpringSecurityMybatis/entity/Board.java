package com.study.SpringSecurityMybatis.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Board {
    private Long id;
    private String title;
    private String content;
    private Long userId;
    private int viewCount;

    private User user; // mapper에서 resultmap - association을 해줬기 때문에 만들어줘야 한다
}
