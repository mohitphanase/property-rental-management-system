package com.rental.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.rental.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
	
	@Autowired
	private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    	

    	http
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth ->
        auth
            .requestMatchers("/user/register","/user/login")
            .permitAll()
            .requestMatchers("/admin/**")
            .hasAuthority("ADMIN")
            .requestMatchers("/owner/**")
            .hasAuthority("OWNER")
            
            .requestMatchers("/tenant/**")
            .hasAuthority("TENANT")
            
            .requestMatchers("/properties/**")
            .authenticated()
            
            .requestMatchers("/bookings/**")
            .authenticated()

            .requestMatchers("/payments/**")
            .authenticated()

            .requestMatchers("/reviews/**")
            .authenticated()

            .requestMatchers("/wishlists/**")
            .authenticated()
            
            .anyRequest()
            .authenticated())
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}