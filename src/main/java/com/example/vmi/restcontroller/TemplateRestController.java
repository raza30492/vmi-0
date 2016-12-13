package com.example.vmi.restcontroller;

import com.example.vmi.storage.TemplateStorageService;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.apache.commons.collections4.map.HashedMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;

@RestController
@RequestMapping("/api/templates")
public class TemplateRestController {
    private final Logger logger = LoggerFactory.getLogger(TemplateRestController.class);
    
    @Autowired private TemplateStorageService storageService;

    @GetMapping
    public ResponseEntity<?> getTemplates() {
        logger.info("getTemplates(): /templates");

        List<Map<String, String>> list = storageService.loadAll()
                .map(
                    (path) -> {
                        Map<String, String> hashmap = new HashedMap<>();
                        hashmap.put("filename", path.getFileName().toString());
                        String href = MvcUriComponentsBuilder
                        .fromMethodName(TemplateRestController.class, "serveFile", path.getFileName().toString())
                        .build().toString();
                        hashmap.put("href", href);
                        return hashmap;
                    }
                ).collect(Collectors.toList());

        return new ResponseEntity<>(list, HttpStatus.OK);
    }

    @GetMapping("/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        logger.info("serveFile(): /templates/" + filename);
        Resource file = storageService.loadAsResource(filename);
        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }
//    
//    @GetMapping("/files/{filename:.+}")
//    @ResponseBody
//    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
//
//        Resource file = storageService.loadAsResource(filename);
//        return ResponseEntity
//                .ok()
//                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\""+file.getFilename()+"\"")
//                .body(file);
//    }

}
