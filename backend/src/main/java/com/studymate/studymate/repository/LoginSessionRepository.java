package com.studymate.studymate.repository;

import com.studymate.studymate.entity.LoginSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoginSessionRepository extends JpaRepository<LoginSession, Long> {
    Optional<LoginSession> findByTokenHash(String tokenHash);
}
