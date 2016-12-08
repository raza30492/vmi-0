package com.example.vmi.restcontroller;

import java.io.IOException;
import java.util.ArrayList;
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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;

import com.example.vmi.dto.SKUMissing;
import com.example.vmi.dto.ProposalData;
import com.example.vmi.dto.Error;
import com.example.vmi.entity.Fit;
import com.example.vmi.service.FitService;
import com.example.vmi.service.ProposalService;
import com.example.vmi.storage.ProposalStorageService;

@RestController
@RequestMapping("/api/proposals")
public class ProposalRestController {
	
	@Autowired ProposalService proposalService;
	
	@Autowired ProposalStorageService storageService;
	
	@Autowired FitService fitService;
	
	@PostMapping("/")
    public ResponseEntity<?> calculateProposal(@RequestBody ProposalData data){
		Error error = new Error();
		proposalService.calculateProposal(data, error); 
		if( error.getCode() != null){
			return new ResponseEntity<Error>(error, HttpStatus.CONFLICT);
		}
    	return new ResponseEntity<Void>(HttpStatus.CREATED);
    }
	
	@GetMapping("/main/{year}")
    public ResponseEntity<?> listMainFiles(@RequestParam("fitName") String fitName, @PathVariable int year) throws IOException {
    	
		Fit fit = fitService.findOne(fitName);
    	List<Map<String, String>> list = storageService.loadAllMainFile(fit, year)
    		.map(
				(path) -> {
					Map<String,String> hashmap = new HashedMap<>();
					hashmap.put("filename", path.getFileName().toString());
	    			String href = MvcUriComponentsBuilder
	    							.fromMethodName(ProposalRestController.class, "serveMainFile", path.getFileName().toString(),fitName, year)
	    							.build().toString();
	    			hashmap.put("href", href);
	    			return hashmap;
				}
    		).collect(Collectors.toList());

        return new ResponseEntity<List<Map<String,String>>>(list, HttpStatus.OK);
    }
	
	 @GetMapping("/mainFiles/{filename:.+}")
	public ResponseEntity<Resource> serveMainFile(@PathVariable String filename,@RequestParam("fitName") String fitName, @RequestParam("year") int year) {
		 Fit fit = fitService.findOne(fitName);
	    Resource file = storageService.loadAsResource(fit, year, filename, "main");
	    return ResponseEntity
	            .ok()
	            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\""+file.getFilename()+"\"")
	            .body(file);
	}
	
	@GetMapping("/summary/{year}")
    public ResponseEntity<?> listSummaryFiles(@RequestParam("fitName") String fitName, @PathVariable int year) throws IOException {
    	
		Fit fit = fitService.findOne(fitName);
    	List<Map<String, String>> list = storageService.loadAllSummaryFile(fit, year)
    		.map(
				(path) -> {
					Map<String,String> hashmap = new HashedMap<>();
					hashmap.put("filename", path.getFileName().toString());
	    			String href = MvcUriComponentsBuilder
	    							.fromMethodName(ProposalRestController.class, "serveSummaryFile", path.getFileName().toString(),fitName, year)
	    							.build().toString();
	    			hashmap.put("href", href);
	    			return hashmap;
				}
    		).collect(Collectors.toList());

        return new ResponseEntity<List<Map<String,String>>>(list, HttpStatus.OK);
    }

	 
	 @GetMapping("/summaryFiles/{filename:.+}")
	public ResponseEntity<Resource> serveSummaryFile(@PathVariable String filename,@RequestParam("fitName") String fitName, @RequestParam("year") int year) {
		 Fit fit = fitService.findOne(fitName);
	    Resource file = storageService.loadAsResource(fit, year, filename, "summary");
	    return ResponseEntity
	            .ok()
	            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\""+file.getFilename()+"\"")
	            .body(file);
	}
}
