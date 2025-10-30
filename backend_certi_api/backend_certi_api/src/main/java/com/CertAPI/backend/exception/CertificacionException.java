package com.CertAPI.backend.exception;

public class CertificacionException extends RuntimeException {
    public CertificacionException(String message) {
        super(message);
    }
    
    public CertificacionException(String message, Throwable cause) {
        super(message, cause);
    }
}
