package com.prepace.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepace.auth.entity.CandidateProfile;
import com.prepace.auth.entity.User;
import com.prepace.auth.repository.CandidateProfileRepository;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

@Service
public class AiAnalysisService {

    private final FileService fileService;
    private final CandidateProfileRepository profileRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String PYTHON_SERVICE_URL = "http://127.0.0.1:8000/analyze";

    public AiAnalysisService(FileService fileService, CandidateProfileRepository profileRepository) {
        this.fileService = fileService;
        this.profileRepository = profileRepository;
    }

    @Transactional
    public Object analyzeResume(User user) {
        try {
            Resource resumeResource = fileService.loadResume(user.getId());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            HttpEntity<Resource> fileEntity = new HttpEntity<>(resumeResource, new HttpHeaders() {{
                setContentDispositionFormData("file", "resume.pdf");
                setContentType(MediaType.APPLICATION_PDF);
            }});
            
            body.add("file", fileEntity);
            body.add("targetRole", user.getTargetRole() != null ? user.getTargetRole() : "Software Engineer");

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    PYTHON_SERVICE_URL,
                    requestEntity,
                    Map.class
            );

            Map responseBody = response.getBody();
            if (responseBody != null) {
                saveOrUpdateCandidateProfile(user, responseBody);
            }

            return responseBody;
        } catch (Exception e) {
            System.err.println("AI Bridge Error: " + e.getMessage());
            throw new RuntimeException("AI Analysis failed: " + e.getMessage());
        }
    }

    @Transactional
    public CandidateProfile getOrBuildProfile(User user) {
        Optional<CandidateProfile> profileOpt = profileRepository.findByUser(user);
        if (profileOpt.isPresent()) {
            return profileOpt.get();
        }

        // Auto-analyze if resume exists
        if (user.getResumeUrl() != null) {
            try {
                analyzeResume(user);
                return profileRepository.findByUser(user).orElseGet(() -> createFallbackProfile(user));
            } catch (Exception e) {
                System.err.println("Failed to auto-analyze resume: " + e.getMessage());
            }
        }

        return createFallbackProfile(user);
    }

    private void saveOrUpdateCandidateProfile(User user, Map analysisData) {
        try {
            String rawJson = objectMapper.writeValueAsString(analysisData);
            Object skillsObj = analysisData.get("skills");
            Object projectsObj = analysisData.get("projects");

            String skillsJson = skillsObj != null ? objectMapper.writeValueAsString(skillsObj) : "{}";
            String projectsJson = projectsObj != null ? objectMapper.writeValueAsString(projectsObj) : "[]";

            CandidateProfile profile = profileRepository.findByUser(user)
                    .orElse(new CandidateProfile(user, user.getTargetRole(), skillsJson, projectsJson, rawJson));

            profile.setTargetRole(user.getTargetRole() != null ? user.getTargetRole() : "Software Engineer");
            profile.setSkillsJson(skillsJson);
            profile.setProjectsJson(projectsJson);
            profile.setRawAnalysisJson(rawJson);

            profileRepository.save(profile);
        } catch (Exception e) {
            System.err.println("Failed to save CandidateProfile: " + e.getMessage());
        }
    }

    private CandidateProfile createFallbackProfile(User user) {
        String role = user.getTargetRole() != null ? user.getTargetRole() : "Software Engineer";
        CandidateProfile profile = new CandidateProfile(user, role, "{}", "[]", "{}");
        return profileRepository.save(profile);
    }
}
