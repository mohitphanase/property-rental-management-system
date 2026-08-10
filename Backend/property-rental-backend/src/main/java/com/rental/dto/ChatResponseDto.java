package com.rental.dto;

import lombok.Data;

@Data
public class ChatResponseDto {
    private String reply;

    public ChatResponseDto(String reply) {
        this.reply = reply;
    }
}