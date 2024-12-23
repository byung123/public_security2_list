package com.study.SpringSecurityMybatis.dto.request;

import com.study.SpringSecurityMybatis.entity.Board;
import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class ReqWriteBoardDto {

    @NotBlank(message = "제목은 빈칸일 수 없습니다.")
    private String title;
    @NotBlank(message = "내용은 공백일 수 없습니다.")
    private String content;

//    public Board toEntity() {
//        return Board.builder()
//                .title(title)
//                .content(content)
//                .userId(1)
//                .build();
//    }
}
