package com.blacksystems.design.service.graph.embedded.test;

import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.Relationship;
import org.neo4j.graphdb.ResourceIterator;
import org.neo4j.graphdb.Result;
import org.neo4j.graphdb.Transaction;

import com.blacksystems.design.service.graph.embedded.Neo4JEmbeddedDatasource;

public class Neo4JEmbeddedDatasourceTest {

    public static void main(String[] args) {
        GraphDatabaseService graphDatabaseService = new Neo4JEmbeddedDatasource().getGraphDatabaseService();

        Transaction beginTx = graphDatabaseService.beginTx();
        
        Result result = graphDatabaseService.execute("match (n)-[r]->() return r");

        ResourceIterator<Relationship> resultIterator = result.columnAs("r");
        
        while (resultIterator.hasNext()) {
            Relationship r = resultIterator.next();
            System.out.println(r.getAllProperties());
        }
        
        /*ResourceIterator<Relationship> resultIterator = result.columnAs("r");//("r")
        Object object = result.next().get("r");
        System.out.println(object);
        
        
        ResourceIterator<Node> resultIteratorw = result.columnAs("r");

        while (resultIterator.hasNext()) {
            Node resultNode = resultIterator.next();
            System.out.println(resultNode.getAllProperties());
        }
*/
        beginTx.success();
        graphDatabaseService.shutdown();

    }
}
