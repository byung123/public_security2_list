package com.study.SpringSecurityMybatis.controller;

import com.study.SpringSecurityMybatis.aspect.annotation.ValidAop;
import com.study.SpringSecurityMybatis.dto.request.ReqBoardListDto;
import com.study.SpringSecurityMybatis.dto.request.ReqSearchBoardDto;
import com.study.SpringSecurityMybatis.dto.request.ReqWriteBoardDto;
import com.study.SpringSecurityMybatis.service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;

@RestController
public class BoardController {

    @Autowired
    BoardService boardService;

    @ValidAop
    @PostMapping("/board")
    public ResponseEntity<?> write(@Valid @RequestBody ReqWriteBoardDto dto, BindingResult bindingResult) {
        Long id = boardService.writeBoard(dto);
        // 강사님 답 - 키-벨류 값으로 넣어줌
//        return ResponseEntity.ok().body(Map.of("boardId", boardService.writeBoard(dto)));
        return ResponseEntity.ok().body(Map.of("boardId", id));
    }

    @GetMapping("/board/search")
    public ResponseEntity<?> getSearchBoards(ReqSearchBoardDto dto) {
        System.out.println(dto);
//        System.out.println(dto.getOption().getClass().getName());
        return ResponseEntity.ok().body(boardService.getSearchBoard(dto));
    }

    @GetMapping("/board/list")
    public ResponseEntity<?> getBoards(ReqBoardListDto dto) {
        return ResponseEntity.ok().body(boardService.getBoardList(dto));
    }

    @GetMapping("/board/{boardId}")
    public ResponseEntity<?> getDetail(@PathVariable Long boardId) {
        return ResponseEntity.ok().body(boardService.getBoardDetail(boardId));
    }

    @GetMapping("/board/{boardId}/like")
    public ResponseEntity<?> getLikeInfo(@PathVariable Long boardId) {
        return ResponseEntity.ok().body(boardService.getBoardLike(boardId));
    }

    @PostMapping("/board/{boardId}/like")
    public ResponseEntity<?> like(@PathVariable Long boardId) {
        boardService.like(boardId);
        return ResponseEntity.ok().body(true);
    }

    @DeleteMapping("/board/like/{boardLikeId}")
    public ResponseEntity<?> dislike(@PathVariable Long boardLikeId) {
        boardService.dislike(boardLikeId);
        return ResponseEntity.ok().body(true);
    }
}
