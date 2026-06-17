package com.rental.controller;

import com.rental.daos.PaymentDao;
import com.rental.dto.PaymentRequestDto;
import com.rental.dto.Resp;
import com.rental.entity.Payment;
import com.rental.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/add")
    public Resp<?> addPayment(@RequestBody PaymentRequestDto dto){
        return Resp.success(paymentService.addPayment(dto));
    }
}
