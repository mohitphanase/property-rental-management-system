package com.rental.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.dto.ChatRequestDto;
import com.rental.dto.ChatResponseDto;
import com.rental.service.AiChatService;

@RestController
@RequestMapping("/api/chat") // Check that this path matches SERVER_URL + /api/chat
@CrossOrigin("*")            // Critical for CORS permission!
public class ChatController {

    @Autowired
    private AiChatService aiChatService;

    @PostMapping
    public ResponseEntity<ChatResponseDto> askAi(@RequestBody ChatRequestDto requestDto) {
        ChatResponseDto response = aiChatService.getAiReply(requestDto);
        return ResponseEntity.ok(response);
    }
}