package com.study.SpringSecurityMybatis.service;

import com.study.SpringSecurityMybatis.dto.request.ReqBoardListDto;
import com.study.SpringSecurityMybatis.dto.request.ReqSearchBoardDto;
import com.study.SpringSecurityMybatis.dto.request.ReqWriteBoardDto;
import com.study.SpringSecurityMybatis.dto.response.RespBoardDetailDto;
import com.study.SpringSecurityMybatis.dto.response.RespBoardLikeInfoDto;
import com.study.SpringSecurityMybatis.dto.response.RespBoardListDto;
import com.study.SpringSecurityMybatis.entity.Board;
import com.study.SpringSecurityMybatis.entity.BoardLike;
import com.study.SpringSecurityMybatis.entity.BoardList;
import com.study.SpringSecurityMybatis.exception.NotFoundBoardException;
import com.study.SpringSecurityMybatis.repository.BoardLikeMapper;
import com.study.SpringSecurityMybatis.repository.BoardMapper;
import com.study.SpringSecurityMybatis.security.principal.PrincipalUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class BoardService {

    @Autowired
    private BoardMapper boardMapper;

    @Autowired
    private BoardLikeMapper boardLikeMapper;

    public Long writeBoard(ReqWriteBoardDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        PrincipalUser principalUser = (PrincipalUser) authentication.getPrincipal();
        Long userId = principalUser.getId();

        Board board = Board.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .userId(userId)
                .build();

        boardMapper.save(board);
        // 강사님 답
//        Board board = dto.toEntity(principalUser.getId())
//        return board.getId();

        List<Board> boardList = boardMapper.findByUserId(userId);

        return boardList.get(boardList.size() - 1).getId();
    }

    public RespBoardListDto getSearchBoard(ReqSearchBoardDto dto) {
        Long startIndex = (dto.getPage() - 1) * dto.getLimit();
        // object 안에 Long값이 들어올 수도 있고 String 값이 들어올 수 있어서 Object 설정
        Map<String, Object> params = Map.of(
                    "startIndex", startIndex,
                    "limit", dto.getLimit(),
                    "searchValue", dto.getSearch() == null ? "" : dto.getSearch(),
                    "option", dto.getOption() == null ? "all" : dto.getOption()
                );
        List<BoardList> boardLists = boardMapper.findAllBySearch(params);
        Integer boardTotalCount = boardMapper.getCountAllBySearch(params);

        return RespBoardListDto.builder()
                .boards(boardLists)
                .totalCount(boardTotalCount)
                .build();
    }

    public RespBoardListDto getBoardList(ReqBoardListDto dto) {
        Long startIndex = (dto.getPage() - 1) * dto.getLimit();
        List<BoardList> boardLists =
                boardMapper.findAllByStartIndexAndLimit(startIndex, dto.getLimit());
        Integer boardTotalCount = boardMapper.getCountAll();

        return RespBoardListDto.builder()
                .boards(boardLists)
                .totalCount(boardTotalCount)
                .build();
    }

    public RespBoardDetailDto getBoardDetail(Long boardId) {

        Board board = boardMapper.findById(boardId);
        if(board == null) {
            throw new NotFoundBoardException("해당 게시글을 찾을 수 없습니다.");
        }
//        System.out.println(board.getViewCount());
        // 조회수 하나 올라가게끔
        boardMapper.modifyViewCountById(boardId);
//        board.setViewCount(board.getViewCount() + 1);

        return RespBoardDetailDto.builder()
                .boardId(board.getId())
                .title(board.getTitle())
                .content(board.getContent())
                .writerId(board.getUserId())
                .writerUsername(board.getUser().getUsername())
                .viewCount(board.getViewCount() + 1) // 위에서 + 1해줘도 된다.
                .build();
    }

    public RespBoardLikeInfoDto getBoardLike(Long boardId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        System.out.println(authentication); // principal이 anonymousUser라고 뜨면 로그인 안된 인증되지 않은 계정이라는 뜻이다
//        System.out.println(authentication.getName()); // anonymousUser
        Long userId = null;

        // anonymous가 아니면(로그인이 돼어 있으면)
        if(!authentication.getName().equals("anonymousUser")) {
            PrincipalUser principalUser = (PrincipalUser) authentication.getPrincipal();
            userId = principalUser.getId();
        }
        System.out.println(userId);
        BoardLike boardLike = boardLikeMapper.findByBoardAndUserId(boardId, userId);
        int likeCount = boardLikeMapper.getLikeCountByBoardId(boardId);
        return RespBoardLikeInfoDto.builder()
                .boardLikeId(boardLike == null ? 0 : boardLike.getId())
                .likeCount(likeCount)
                .build();
    }

    public void like(Long boardId) {
        PrincipalUser principalUser = (PrincipalUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        BoardLike boardLike = BoardLike.builder()
                .boardId(boardId)
                .userId(principalUser.getId())
                .build();
        boardLikeMapper.save(boardLike);
    }

    public void dislike(Long boardLikeId) {
        boardLikeMapper.deleteById(boardLikeId);
    }
}
