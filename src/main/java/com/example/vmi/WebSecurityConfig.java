package com.example.vmi;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@EnableWebSecurity
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .requestMatchers().antMatchers("/**","/api/**")
        .and()
            .authorizeRequests()
                .antMatchers("/api/employees/logon").permitAll()
                .antMatchers("/api/employees/forgotPassword").permitAll()
                .antMatchers("/api/**").authenticated()
                .antMatchers("/**").permitAll()
        .and()
            .httpBasic()
        .and()
            .csrf().disable();
    }
	
}

