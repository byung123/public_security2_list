package com.study.SpringSecurityMybatis.repository;

import com.study.SpringSecurityMybatis.entity.Comment;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CommentMapper {
    int save(Comment comment);
    // set으로 하면 oederby 한게 다 없어질 수 있기 때문에 list로 들고온다
    List<Comment> findAllByBoardId(Long boardId);
    int getCommentCountByBoardId(Long boardId);
    int modifyComment(Comment comment);
    int deleteById(Long id);
    Comment findById(Long id);
    Comment findByParentId(Long parentId);
}
