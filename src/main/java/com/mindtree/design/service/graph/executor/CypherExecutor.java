package com.mindtree.design.service.graph.executor;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.neo4j.graphdb.Result;


public interface CypherExecutor {
    
    
    Iterator<Map<String,Object>> query(String statement, Map<String,Object> params);
    
    Result queryResult(String statement, Map<String,Object> params);
    
    List<Result> queryResult(String statement, Map<String,Object> params, boolean commitTransaction);
}
