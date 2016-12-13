package com.example.vmi.storage;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

@Service
public class TemplateStorageService {
    private final Logger logger = LoggerFactory.getLogger(TemplateStorageService.class);
    private final Path rootLocation;
    private final Path templateLocation;

    @Autowired
    public TemplateStorageService(StorageProperties properties) {
        this.rootLocation = Paths.get(properties.getLocation());
        this.templateLocation = rootLocation.resolve("template");
    }

    public Stream<Path> loadAll() {
        logger.info("loadAll()");
        try {
            return Files.walk(templateLocation, 1)
                    .filter(path -> !path.equals(templateLocation))
                    .map(path -> templateLocation.relativize(path));
        } catch (IOException e) {
            throw new StorageException("Failed to read template files", e);
        }

    }

    public Path load(String filename) {
        return templateLocation.resolve(filename);
    }

    public Resource loadAsResource(String filename) {
        logger.info("loadAsResource(): filename-" + filename);
        try {
            Path file = load(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                logger.info("Could not read file: " + filename);
                throw new StorageFileNotFoundException("Could not read file: " + filename);

            }
        } catch (MalformedURLException e) {
            logger.info("Could not read file: " + filename, e);
            throw new StorageFileNotFoundException("Could not read file: " + filename, e);
        }
    }

    public void init() {
        logger.info("init()");
        try {
            if (!Files.exists(rootLocation, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})) {
                Files.createDirectory(rootLocation);
                logger.info("Created " + rootLocation.toString() + " directory");
            }
            if (!Files.exists(templateLocation, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})) {
                Files.createDirectory(templateLocation);
                logger.info("Created " + templateLocation.toString() + " directory");
            }
        } catch (IOException e) {
            logger.info("Could not initialize storage", e);
            throw new StorageException("Could not initialize storage", e);
        }
    }
}
