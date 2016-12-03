package com.example.vmi.storage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

@Service
public class FileSystemStorageService implements StorageService {

    private final Path rootLocation;

    @Autowired
    public FileSystemStorageService(StorageProperties properties) {
        this.rootLocation = Paths.get(properties.getLocation());
    }

    @Override
    public void store(int year, MultipartFile file, String filename) throws FileAlreadyExistsException {
    	Path dir = rootLocation.resolve(String.valueOf(year));
    	
        try {
        	if(!Files.exists(dir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(dir);
        	}       	
        	if (file.isEmpty()) {
                throw new StorageException("Failed to store empty file " + file.getOriginalFilename());
            }
            Files.copy(file.getInputStream(), dir.resolve(filename));
        }
        catch (FileAlreadyExistsException ex){
        	System.out.println("File Already Exist");
        	throw ex;
        }
        catch (IOException e) {
            throw new StorageException("Failed to store file " + file.getOriginalFilename(), e);
        }
    }
    
    @Override
    public void store(int year, MultipartFile file) throws FileAlreadyExistsException{
    	store(year, file, file.getOriginalFilename());
    }

    @Override
    public Stream<Path> loadAll(int year) {
    	Path dir = rootLocation.resolve(String.valueOf(year));
        try {
        	if(!Files.exists(dir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(dir);
        	}
            return Files.walk(dir, 1)
                    .filter(path -> !path.equals(dir))
                    .map(path -> dir.relativize(path));
        } catch (IOException e) {
            throw new StorageException("Failed to read stored files", e);
        }

    }

    @Override
    public Path load(int year, String filename) {
        return rootLocation.resolve(String.valueOf(year)).resolve(filename);
    }

    @Override
    public Resource loadAsResource(int year,String filename) {
        try {
            Path file = load(year, filename);
            Resource resource = new UrlResource(file.toUri());
            if(resource.exists() || resource.isReadable()) {
                return resource;
            }
            else {
                throw new StorageFileNotFoundException("Could not read file: " + filename);

            }
        } catch (MalformedURLException e) {
            throw new StorageFileNotFoundException("Could not read file: " + filename, e);
        }
    }
    
    

    @Override
	public void delete(int year, String filename) {
    	Path file = rootLocation.resolve(String.valueOf(year)).resolve(filename);
    	try {
			Files.deleteIfExists(file);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@Override
    public void deleteAll() {
        FileSystemUtils.deleteRecursively(rootLocation.toFile());
    }

    @Override
    public void init() {
        try {
        	if(!Files.exists(rootLocation, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(rootLocation);
        	}
        } catch (IOException e) {
            throw new StorageException("Could not initialize storage", e);
        }
    }
}
