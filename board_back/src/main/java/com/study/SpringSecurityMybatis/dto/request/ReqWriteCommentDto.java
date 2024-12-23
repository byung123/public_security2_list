package com.study.SpringSecurityMybatis.dto.request;

import com.study.SpringSecurityMybatis.entity.Comment;
import lombok.Data;

@Data
public class ReqWriteCommentDto {
    private Long boardId;
    private Long parentId; // 대댓글인지, 전체 댓글의 댓글인지 구분 짓기 위한 변수
    private String content;
    // userId나 등등은 securityContextHolder에서 꺼내 쓰면 된다

    public Comment toEntity(Long writerId) {
        return Comment.builder()
                .boardId(boardId)
                .parentId(parentId)
                .content(content)
                .writerId(writerId)
                .build();
    }
}
