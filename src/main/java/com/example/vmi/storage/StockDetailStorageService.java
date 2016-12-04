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
public class StockDetailStorageService {
	
	private final Path rootLocation;
    private final Path salesLocation;

    @Autowired
    public StockDetailStorageService(StorageProperties properties) {
    	this.rootLocation = Paths.get(properties.getLocation());
        this.salesLocation = rootLocation.resolve("sales");
    }

    public void store(int buyerId, int year, MultipartFile file, String filename) throws FileAlreadyExistsException {
    	Path buyerDir = salesLocation.resolve(String.valueOf("buyer"+buyerId));
    	Path yearDir = buyerDir.resolve(String.valueOf(year));
    	
        try {
        	if(!Files.exists(buyerDir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(buyerDir);
        	}
        	if(!Files.exists(yearDir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(yearDir);
        	}       	
        	if (file.isEmpty()) {
                throw new StorageException("Failed to store empty file " + file.getOriginalFilename());
            }
            Files.copy(file.getInputStream(), yearDir.resolve(filename));
        }
        catch (FileAlreadyExistsException ex){
        	System.out.println("File Already Exist");
        	throw ex;
        }
        catch (IOException e) {
            throw new StorageException("Failed to store file " + file.getOriginalFilename(), e);
        }
    }
    
    public void store(int buyerId, int year, MultipartFile file) throws FileAlreadyExistsException{
    	store(buyerId, year, file, file.getOriginalFilename());
    }

    public Stream<Path> loadAll(int buyerId, int year) {
    	Path buyerDir = salesLocation.resolve(String.valueOf("buyer"+buyerId));
    	Path yearDir = buyerDir.resolve(String.valueOf(year));
        try {
        	if(!Files.exists(buyerDir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(buyerDir);
        	}
        	if(!Files.exists(yearDir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(yearDir);
        	}
            return Files.walk(yearDir, 1)
                    .filter(path -> !path.equals(yearDir))
                    .map(path -> yearDir.relativize(path));
        } catch (IOException e) {
            throw new StorageException("Failed to read stored files", e);
        }

    }

    public Path load(int buyerId, int year, String filename) {
        return salesLocation.resolve(String.valueOf("buyer"+buyerId)).resolve(String.valueOf(year)).resolve(filename);
    }

    public Resource loadAsResource(int buyerId, int year,String filename) {
        try {
            Path file = load(buyerId, year, filename);
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
   
	public void delete(int buyerId, int year, String filename) {
    	Path file = salesLocation.resolve(String.valueOf("buyer"+buyerId)).resolve(String.valueOf(year)).resolve(filename);
    	try {
			Files.deleteIfExists(file);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

    public void deleteAll() {
        FileSystemUtils.deleteRecursively(salesLocation.toFile());
    }

    public void init() {
        try {
        	if(!Files.exists(rootLocation, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(rootLocation);
        	}
        	if(!Files.exists(salesLocation, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(salesLocation);
        	}
        } catch (IOException e) {
            throw new StorageException("Could not initialize storage", e);
        }
    }
}
