package com.example.vmi.restcontroller;

import com.example.vmi.entity.Fit;
import com.example.vmi.service.FitService;
import javax.websocket.server.PathParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.Resource;
import static org.springframework.hateoas.mvc.ControllerLinkBuilder.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@RepositoryRestController
public class FitRestController {
    private final Logger logger = LoggerFactory.getLogger(FitRestController.class);
    
    @Autowired FitService fitService;
    
    @RequestMapping(value = {"/fits/{id}"}, method=RequestMethod.PUT)
    public ResponseEntity<?> updateFit(@PathVariable("id") Integer id,@RequestBody Fit fit){
        logger.info("updateFit(): /fits/" + id);
        if(fit.getId() != null && id != fit.getId()){
            return new ResponseEntity<>("Fit id mismatch.", HttpStatus.CONFLICT);
        }else if(fitService.findOne(id) == null){
            return new ResponseEntity<>("Fit not found.", HttpStatus.NOT_FOUND);
        }else{
        	
            fit.setId(id);
            fit = fitService.updateFit(fit);
            Resource<Fit> resource = new Resource<Fit>(fit);
            //resource.add(linkTo(methodOn(FitRestController.class).updateFit(id, fit)).withSelfRel());
            return new ResponseEntity<>(resource, HttpStatus.OK);
        }
    }
}
