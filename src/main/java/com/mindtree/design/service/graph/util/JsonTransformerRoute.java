/*package com.mindtree.design.service.graph.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import spark.ResponseTransformerRoute;


public abstract class JsonTransformerRoute extends ResponseTransformerRoute {

    private Gson gson = new GsonBuilder().disableHtmlEscaping().create();

    public JsonTransformerRoute(String path) {
        super(path, "application/json");
    }

    @Override
    public String render(Object model) {
        return gson.toJson(model);
    }

}
*/