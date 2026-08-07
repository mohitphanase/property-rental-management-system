package com.rental.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
	
	@Autowired
	private JwtUtil jwtUtil;
	@Autowired
    private CustomUserDetailsService customUserDetailsService;

	@Override
	protected void doFilterInternal(HttpServletRequest request,
	        HttpServletResponse response,
	        FilterChain filterChain)
	        throws ServletException, IOException {

	    System.out.println("=================================");
	    System.out.println("URI: " + request.getRequestURI());

	    String token = request.getHeader("Token");
	    System.out.println("Token Header: " + token);

	    if (token != null && jwtUtil.validateToken(token)) {

	        String email = jwtUtil.extractEmail(token);

	        UserDetails userDetails =
	                customUserDetailsService.loadUserByUsername(email);

	        UsernamePasswordAuthenticationToken authToken =
	                new UsernamePasswordAuthenticationToken(
	                        userDetails,
	                        null,
	                        userDetails.getAuthorities());

	        authToken.setDetails(
	                new WebAuthenticationDetailsSource().buildDetails(request));

	        SecurityContextHolder.getContext().setAuthentication(authToken);

	        System.out.println("Authenticated User: " + email);
	        System.out.println("Authorities: " + userDetails.getAuthorities());

	    } else {
	        System.out.println("Token is missing or invalid!");
	    }

	    filterChain.doFilter(request, response);
	}

}
