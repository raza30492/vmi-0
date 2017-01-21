package com.example.vmi.exception;

public class InconsistentEditException extends InconsistentDataException{
	
	public InconsistentEditException(String message){
        super(message);
    }
    
    public InconsistentEditException(String message, Throwable cause){
        super(message, cause);
    }
}
