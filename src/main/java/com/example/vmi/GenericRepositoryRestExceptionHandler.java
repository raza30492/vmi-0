package com.example.vmi;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.example.vmi.dto.RestError;
import com.example.vmi.exception.InconsistentEditException;
import com.example.vmi.storage.StorageFileNotFoundException;

@ControllerAdvice
public class GenericRepositoryRestExceptionHandler{

    @Autowired
    MessageSource messageSource;

    @ExceptionHandler
    ResponseEntity<?> handleConflict(DataIntegrityViolationException e) {
    	String cause = e.getRootCause().getMessage();
    	if(cause.toLowerCase().contains("duplicate")){
    		return response(HttpStatus.CONFLICT, 40901, "Duplicate Entry. Data with same name already exist in database.", e.getRootCause().getMessage(), "");
    	}else if(cause.toLowerCase().contains("cannot delete")){
    		return response(HttpStatus.CONFLICT, 40903, "Deletion restricted to prevent data inconsistency.", e.getRootCause().getMessage(), "");
    	}
        return response(HttpStatus.CONFLICT, 40900, "Operation cannot be performed. Integrity Constraint violated.", e.getRootCause().getMessage(), "");
    }

    @ExceptionHandler
    ResponseEntity<?> handleFileNotFound(StorageFileNotFoundException e) {
        return response(HttpStatus.NOT_FOUND, 40401, "File Not Found", e.getMessage(), "");
    }
    
    @ExceptionHandler
    ResponseEntity<?> handleInconsistentEditException(InconsistentEditException e){
        return response(HttpStatus.CONFLICT, 40902, e.getMessage());
    }

    private ResponseEntity<RestError> response(HttpStatus status, int code, String msg) {
        return response(status, code, msg, "", "");
    }

    private ResponseEntity<RestError> response(HttpStatus status, int code, String msg, String devMsg, String moreInfo) {
        return new ResponseEntity<>(new RestError(status.value(), code, msg, devMsg, moreInfo), status);
    }
}

/*
 
 */
