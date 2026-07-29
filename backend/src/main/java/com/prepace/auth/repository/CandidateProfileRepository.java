package com.prepace.auth.repository;

import com.prepace.auth.entity.CandidateProfile;
import com.prepace.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, UUID> {
    Optional<CandidateProfile> findByUser(User user);
    Optional<CandidateProfile> findByUserId(UUID userId);
}
