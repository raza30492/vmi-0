package com.example.vmi.restcontroller;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.commons.collections4.map.HashedMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;

import com.example.vmi.dto.ProposalData;
import com.example.vmi.dto.Error;
import com.example.vmi.dto.Proposal;
import com.example.vmi.entity.Fit;
import com.example.vmi.service.FitService;
import com.example.vmi.service.ProposalService;
import com.example.vmi.storage.ProposalStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/proposals")
public class ProposalRestController {
    private final Logger logger = LoggerFactory.getLogger(ProposalRestController.class);
    
    @Autowired
    ProposalService proposalService;

    @Autowired
    ProposalStorageService storageService;

    @Autowired
    FitService fitService;

    @PostMapping("/calculate")
    public ResponseEntity<?> calculateProposal(@RequestBody ProposalData data) {
        logger.info("calculateProposal(): /proposals/calculate");
        Error error = new Error();
        proposalService.calculateProposal(data, error);
        if (error.getCode() != null) {
            return new ResponseEntity<>(error, HttpStatus.CONFLICT);
        }
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping("/main/{year}")
    public ResponseEntity<?> listMainFiles(@RequestParam("fitName") String fitName, @PathVariable int year) throws IOException {
        logger.info("listMainFiles(): /proposals/main/" + year);
        Fit fit = fitService.findOne(fitName);
        List<Map<String, String>> list = storageService.loadAllMainFile(fit, year)
                .map(
                        (path) -> {
                            Map<String, String> hashmap = new HashedMap<>();
                            hashmap.put("filename", path.getFileName().toString());
                            String href = MvcUriComponentsBuilder
                            .fromMethodName(ProposalRestController.class, "serveMainFile", path.getFileName().toString(), fitName, year)
                            .build().toString();
                            hashmap.put("href", href);
                            return hashmap;
                        }
                ).collect(Collectors.toList());

        return new ResponseEntity<List<Map<String, String>>>(list, HttpStatus.OK);
    }

    @GetMapping("/mainFiles/{filename:.+}")
    public ResponseEntity<Resource> serveMainFile(@PathVariable String filename, @RequestParam("fitName") String fitName, @RequestParam("year") int year) {
        logger.info("serveMainFiles(): /proposals/mainFiles/" + filename);
        Fit fit = fitService.findOne(fitName);
        Resource file = storageService.loadAsResource(fit, year, filename, "main");
        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }
    
     @GetMapping("/mainData/{filename:.+}")
    public ResponseEntity<List<Proposal>> serveMainData(@PathVariable String filename, @RequestParam("fitName") String fitName, @RequestParam("year") int year) {
        logger.info("serveMainData(): /proposals/mainFiles/" + filename);
        Fit fit = fitService.findOne(fitName);
        List<Proposal> list = proposalService.getProposalListFromFile(fit, year, filename, "main");
        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(list);
    }

    @GetMapping("/summary/{year}")
    public ResponseEntity<?> listSummaryFiles(@RequestParam("fitName") String fitName, @PathVariable int year) throws IOException {
        logger.info("listSummaryFiles(): /proposals/summary/" + year);
        Fit fit = fitService.findOne(fitName);
        List<Map<String, String>> list = storageService.loadAllSummaryFile(fit, year)
                .map(
                        (path) -> {
                            Map<String, String> hashmap = new HashedMap<>();
                            hashmap.put("filename", path.getFileName().toString());
                            String href = MvcUriComponentsBuilder
                            .fromMethodName(ProposalRestController.class, "serveSummaryFile", path.getFileName().toString(), fitName, year)
                            .build().toString();
                            hashmap.put("href", href);
                            return hashmap;
                        }
                ).collect(Collectors.toList());

        return new ResponseEntity<List<Map<String, String>>>(list, HttpStatus.OK);
    }

    @GetMapping("/summaryFiles/{filename:.+}")
    public ResponseEntity<Resource> serveSummaryFile(@PathVariable String filename, @RequestParam("fitName") String fitName, @RequestParam("year") int year) {
        logger.info("serveSummaryFiles(): /proposals/summaryFiles/" + filename);
        Fit fit = fitService.findOne(fitName);
        Resource file = storageService.loadAsResource(fit, year, filename, "summary");
        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }
    
    @GetMapping("/summaryData/{filename:.+}")
    public ResponseEntity<List<Proposal>> serveSummaryData(@PathVariable String filename, @RequestParam("fitName") String fitName, @RequestParam("year") int year) {
        logger.info("serveSummaryFiles(): /proposals/summaryFiles/" + filename);
        Fit fit = fitService.findOne(fitName);
        List<Proposal> list = proposalService.getProposalListFromFile(fit, year, filename, "main");
        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(list);
    }
}
