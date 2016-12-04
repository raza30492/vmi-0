package com.example.vmi.storage;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.vmi.entity.Fit;

@Service
@Transactional(readOnly = true)
public class ProposalStorageService {
	
	private final Path rootLocation;
    private final Path proposalLocation;

    @Autowired
    public ProposalStorageService(StorageProperties properties) {
    	this.rootLocation = Paths.get(properties.getLocation());
        this.proposalLocation = rootLocation.resolve("proposals");
    }

	public void init() {
		try {
        	if(!Files.exists(rootLocation, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(rootLocation);
        	}
        	if(!Files.exists(proposalLocation, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(proposalLocation);
        	}
        } catch (IOException e) {
            throw new StorageException("Could not initialize storage", e);
        }
	}

	public void store(int buyerId, int year, MultipartFile file, String filename) throws FileAlreadyExistsException {
		// TODO Auto-generated method stub
		
	}

	public void store(int buyerId, int year, MultipartFile file) throws FileAlreadyExistsException {
		// TODO Auto-generated method stub
		
	}

	public Stream<Path> loadAllMainFile(Fit fit, int year) {
		Path buyerDir = proposalLocation.resolve("buyer"+fit.getBuyer().getId());
		Path fitDir = buyerDir.resolve("fit"+fit.getId());
    	Path yearDir = fitDir.resolve(String.valueOf(year));
    	Path mainDir = yearDir.resolve("main");
        try {
        	if(!Files.exists(buyerDir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(buyerDir);
        	}
        	if(!Files.exists(fitDir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(fitDir);
        	}
        	if(!Files.exists(yearDir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(yearDir);
        	}
        	if(!Files.exists(mainDir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(mainDir);
        	}
            return Files.walk(mainDir, 1)
                    .filter(path -> !path.equals(mainDir))
                    .map(path -> mainDir.relativize(path));
        } catch (IOException e) {
            throw new StorageException("Failed to read stored files", e);
        }
	}
	
	public Stream<Path> loadAllSummaryFile(Fit fit, int year) {
		Path buyerDir = proposalLocation.resolve("buyer"+fit.getBuyer().getId());
		Path fitDir = buyerDir.resolve("fit"+fit.getId());
    	Path yearDir = fitDir.resolve(String.valueOf(year));
    	Path summayDir = yearDir.resolve("summary");
        try {
        	if(!Files.exists(buyerDir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(buyerDir);
        	}
        	if(!Files.exists(fitDir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(fitDir);
        	}
        	if(!Files.exists(yearDir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(yearDir);
        	}
        	if(!Files.exists(summayDir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})){
        		Files.createDirectory(summayDir);
        	}
            return Files.walk(summayDir, 1)
                    .filter(path -> !path.equals(summayDir))
                    .map(path -> summayDir.relativize(path));
        } catch (IOException e) {
            throw new StorageException("Failed to read stored files", e);
        }
	}

	public Path load(Fit fit, int year, String filename, String type) {
		return proposalLocation
				.resolve("buyer"+fit.getBuyer().getId())
				.resolve("fit"+fit.getId())
				.resolve(String.valueOf(year))
				.resolve(type)
				.resolve(filename);
	}

	public Resource loadAsResource(Fit fit, int year, String filename, String type) {
		try {
            Path file = load(fit, year, filename, type);
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

	public void deleteAll() {
		// TODO Auto-generated method stub
		
	}

	public void delete(int buyerId, int year, String filename) {
		// TODO Auto-generated method stub
		
	}

}
