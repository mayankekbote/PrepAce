package com.prepace.auth.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSchemaMigration implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(DatabaseSchemaMigration.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            LOGGER.info("Executing database schema migration: dropping outdated question_kind check constraint if exists...");
            jdbcTemplate.execute("ALTER TABLE interview_questions DROP CONSTRAINT IF EXISTS interview_questions_question_kind_check;");
            LOGGER.info("Successfully dropped interview_questions_question_kind_check constraint.");
        } catch (Exception e) {
            LOGGER.warn("Failed to drop interview_questions_question_kind_check constraint: {}", e.getMessage());
        }
    }
}
