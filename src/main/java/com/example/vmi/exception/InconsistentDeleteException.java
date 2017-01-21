package com.example.vmi.exception;

public class InconsistentDeleteException extends InconsistentDataException{
    
    public InconsistentDeleteException(String message){
        super(message);
    }
    
    public InconsistentDeleteException(String message, Throwable cause){
        super(message, cause);
    }
}
