package com.study.SpringSecurityMybatis.service;

import com.study.SpringSecurityMybatis.dto.request.ReqModifyCommentDto;
import com.study.SpringSecurityMybatis.dto.request.ReqWriteCommentDto;
import com.study.SpringSecurityMybatis.dto.response.RespCommentDto;
import com.study.SpringSecurityMybatis.entity.Comment;
import com.study.SpringSecurityMybatis.exception.AccessDeniedException;
import com.study.SpringSecurityMybatis.repository.CommentMapper;
import com.study.SpringSecurityMybatis.security.principal.PrincipalUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentMapper commentMapper;

    public void write(ReqWriteCommentDto dto) {
        PrincipalUser principalUser = (PrincipalUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        commentMapper.save(dto.toEntity(principalUser.getId()));
    }

    public RespCommentDto getComments(Long boardId) {
        return RespCommentDto.builder()
                .comments(commentMapper.findAllByBoardId(boardId))
                .commentCount(commentMapper.getCommentCountByBoardId(boardId))
                .build();
    }

    public void modifyComment(ReqModifyCommentDto dto) {
        accessCheck(dto.getCommentId());
        Comment comment = dto.toEntity();
        commentMapper.modifyComment(comment);
    }

    public void deleteComment(Long commentId) {
        accessCheck(commentId);

        // 안돼서 쿼리문 다시 짬
//        List<Comment> deleteComments = new ArrayList<>();
//        Comment childrenComment = null;
//        Long parentId = commentId;
//        while ((commentMapper.findByParentId(parentId)) != null) {
//            deleteComments.add(childrenComment);
//            parentId = childrenComment.getId(); // 찾을 때 마다 parentId가 증가하면서 반복문을 돌게 된다
//        }

        commentMapper.deleteById(commentId);
    }

    private void accessCheck(Long commentId) {
        PrincipalUser principalUser = (PrincipalUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        Comment comment = commentMapper.findById(commentId);

        // 프론트앤드 무시하고 예를 들어 포스트맨에서 날리는 요청 방지
        if(principalUser.getId() != comment.getWriterId()) {
            throw new AccessDeniedException();
        }
    }
}
