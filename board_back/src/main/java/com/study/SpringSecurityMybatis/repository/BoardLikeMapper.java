package com.study.SpringSecurityMybatis.repository;

import com.study.SpringSecurityMybatis.entity.BoardLike;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface BoardLikeMapper {
    int save(BoardLike boardLike);
    int deleteById(Long id);
    BoardLike findByBoardAndUserId(@Param("boardId") Long boardId,
                                   @Param("userId") Long userId);
    int getLikeCountByBoardId(Long boardId);
}
