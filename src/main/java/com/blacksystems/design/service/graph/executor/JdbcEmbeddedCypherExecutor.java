package com.blacksystems.design.service.graph.executor;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.Result;
import org.neo4j.graphdb.Transaction;

import com.blacksystems.design.service.graph.embedded.Neo4JEmbeddedDatasource;

public class JdbcEmbeddedCypherExecutor implements CypherExecutor {

    Neo4JEmbeddedDatasource Neo4JEmbeddedDatasource = new Neo4JEmbeddedDatasource();

    private GraphDatabaseService graphDatabaseService;

    public JdbcEmbeddedCypherExecutor() {
        graphDatabaseService = Neo4JEmbeddedDatasource.getGraphDatabaseService();
    }

    @Override
    public Iterator<Map<String, Object>> query(String statement, Map<String, Object> params) {
        final Result result = queryResult(statement, params);

        return new Iterator<Map<String, Object>>() {

            @Override
            public boolean hasNext() {
                return result.hasNext();
            }

            @Override
            public Map<String, Object> next() {
                return result.next();
            }

            @Override
            public void remove() {
            }
        };
    }

    @Override
    public Result queryResult(String statement, Map<String, Object> params) {
        Transaction tx = graphDatabaseService.beginTx();
        final Result result = executeQuery(statement, params);
        tx.success();
        return result;
    }
    
    @Override
    public List<Result> queryResult(String statementQuery, Map<String, Object> params, boolean commitTransaction) {
        Transaction tx = graphDatabaseService.beginTx();
        
        List<Result> results = new ArrayList<Result>();
        String[] statementSplit = statementQuery.split(";");
        for (String statement : statementSplit) {
            results.add(executeQuery(statement, params));
        }
        
        tx.success();
        tx.close();
        return results;
    }

    private Result executeQuery(String statement, Map<String, Object> params) {
        Result resultTemp = null;
        if (params == null || params.isEmpty()) {
            resultTemp = graphDatabaseService.execute(statement);
        }
        else {
            resultTemp = graphDatabaseService.execute(statement, params);
        }
        final Result result = resultTemp;
        return result;
    }

    
}
