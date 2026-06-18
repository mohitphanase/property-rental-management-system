package com.rental.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminMonthlyDataDto {
	
	private String month;
    private BigDecimal value;

}
