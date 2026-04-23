package com.prepace.auth.service;

import com.prepace.auth.entity.User;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AiAnalysisService {

    private final FileService fileService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final String PYTHON_SERVICE_URL = "http://127.0.0.1:8000/analyze";

    public AiAnalysisService(FileService fileService) {
        this.fileService = fileService;
    }

    public Object analyzeResume(User user) {
        try {
            Resource resumeResource = fileService.loadResume(user.getId());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Explicitly wrap the resource to provide a filename, which FastAPI/Python requires
            HttpEntity<Resource> fileEntity = new HttpEntity<>(resumeResource, new HttpHeaders() {{
                setContentDispositionFormData("file", "resume.pdf");
                setContentType(MediaType.APPLICATION_PDF);
            }});
            
            body.add("file", fileEntity);
            body.add("targetRole", user.getTargetRole() != null ? user.getTargetRole() : "Software Engineer");

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Object> response = restTemplate.postForEntity(
                    PYTHON_SERVICE_URL,
                    requestEntity,
                    Object.class
            );

            return response.getBody();
        } catch (Exception e) {
            System.err.println("AI Bridge Error: " + e.getMessage());
            throw new RuntimeException("AI Analysis failed: " + e.getMessage());
        }
    }
}
