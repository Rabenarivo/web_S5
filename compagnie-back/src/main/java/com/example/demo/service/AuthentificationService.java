package com.example.demo.service;

import com.example.demo.DTO.*;
import com.example.demo.entite.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthentificationService {

    private static final int MAX_TENTATIVES = 3;
    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();




}