package com.study.SpringSecurityMybatis.repository;

import com.study.SpringSecurityMybatis.entity.Board;
import com.study.SpringSecurityMybatis.entity.BoardList;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface BoardMapper {
    Long save(Board board);
    List<Board> findByUserId(Long id);
    Board findById(Long id);
    List<BoardList> findAllByStartIndexAndLimit(
            @Param("startIndex") Long startIndex,
            @Param("limit") Long limit);
    // Long(Wrapper 자료형)으로 입력 받으면 null을 입력받을 수 있다
    // long(literal 자료형)으로 입력받으면 null을 입력 못받는다(오류)
    List<BoardList> findAllBySearch(Map<String, Object> params);
    int modifyViewCountById(Long id);
    int getCountAll();
    int getCountAllBySearch(Map<String, Object> params);
}