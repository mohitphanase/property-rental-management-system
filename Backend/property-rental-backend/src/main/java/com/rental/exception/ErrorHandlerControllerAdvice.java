package com.rental.exception;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.rental.dto.Resp;

@RestControllerAdvice
public class ErrorHandlerControllerAdvice {
	@ExceptionHandler
	public Resp<?> handleError(Exception ex) {
		String msg =  ex.getMessage();
		return Resp.error(msg);
	}
}
