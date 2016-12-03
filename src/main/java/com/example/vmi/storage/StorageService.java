package com.example.vmi.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Path;
import java.util.stream.Stream;

public interface StorageService {

    void init();

    void store(int year, MultipartFile file, String filename) throws FileAlreadyExistsException;
    
    void store(int year, MultipartFile file) throws FileAlreadyExistsException;

    Stream<Path> loadAll(int year);

    Path load(int year, String filename);

    Resource loadAsResource(int year, String filename);

    void deleteAll();
    
    void delete(int year, String filename);

}
