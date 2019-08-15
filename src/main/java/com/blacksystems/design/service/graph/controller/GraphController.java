package com.blacksystems.design.service.graph.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.blacksystems.design.service.graph.ServiceGraphService;

@RestController
public class GraphController {

    private static final Logger LOGGER = LoggerFactory.getLogger(GraphController.class);
    
    @Autowired
    private ServiceGraphService service;

    
    @RequestMapping(value = "/cquery/{query}", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_VALUE)
    public Object cquery(@PathVariable("query") String query) {
        LOGGER.debug("Received request cquery {}", query);
        return service.cquery(query);
    }

    @RequestMapping(value = "/graph", method = RequestMethod.GET, consumes=MediaType.APPLICATION_JSON_VALUE)
    public Object graph() {
        LOGGER.debug("Received request for Complete Graph");
        return service.graph();
    }

    /*@ExceptionHandler
    @ResponseStatus(HttpStatus.CONFLICT)
    public String handleDuplicateEmployeeException(DuplicateDataException e) {
        return e.getMessage();
    }
    
    @ExceptionHandler
    @ResponseStatus(HttpStatus.CONFLICT)
    public String handleInsuffcientEmployeeException(InsufficientDataException e) {
        return e.getMessage();
    }
*/
}
