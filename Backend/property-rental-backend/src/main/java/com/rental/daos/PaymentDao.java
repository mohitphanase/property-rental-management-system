package com.rental.daos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.entity.Payment;

public interface PaymentDao extends JpaRepository<Payment,Long> {

    

}
