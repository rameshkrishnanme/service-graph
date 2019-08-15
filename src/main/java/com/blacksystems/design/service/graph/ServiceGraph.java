/*package com.blacksystems.design.service.graph;

import static spark.Spark.setPort;
import static spark.Spark.staticFileLocation;

import com.blacksystems.design.service.graph.util.Util;

public class ServiceGraph {

    public static void main(String[] args) {
        setPort(Util.getWebPort());
        staticFileLocation("webapp");
        final ServiceGraphService service = new ServiceGraphService(Util.getNeo4jUrl());
        new ServiceGraphApplication(service).init();
    }
}
*/