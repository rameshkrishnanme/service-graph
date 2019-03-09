/*    package com.mindtree.design.service.graph;

import static org.neo4j.helpers.collection.MapUtil.map;
import static spark.Spark.get;

import java.io.UnsupportedEncodingException;

import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;

import spark.Request;
import spark.Response;
import spark.servlet.SparkApplication;

import com.mindtree.design.service.graph.util.JsonTransformerRoute;

public class ServiceGraphApplication implements SparkApplication {

    private static final Logger LOG = org.slf4j.LoggerFactory.getLogger(ServiceGraphApplication.class);

    private ServiceGraphService service;

    public ServiceGraphApplication(ServiceGraphService service) {
        this.service = service;
    }

    @Override
    public void init() {
        get(new JsonTransformerRoute("/cquery/:query") {
            public Object handle(Request request, Response response) {
                try {
                    String query = java.net.URLDecoder.decode(request.params("query"), "UTF-8");
                    return service.cquery(query);
                }
                catch (Exception e) {
                    LOG.error(e.getMessage());
                    response.status(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    return map("status", "failure", "message", e.getMessage());
                }
            }
        });
        get(new JsonTransformerRoute("/graph") {
            @Override
            public Object handle(Request request, Response response) {
                return service.graph();
            }
        });
    }
}
*/