package com.prepace.auth.exception;

public class SessionNotCompletedException extends RuntimeException {
    public SessionNotCompletedException(String message) {
        super(message);
    }
}
