package com.blacksystems.design.service.graph.embedded;

import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.factory.GraphDatabaseFactory;

public class Neo4JEmbeddedDatasource {

    static GraphDatabaseService graphDb;

    static String DB_PATH = "c://neo4j_new5";

    public GraphDatabaseService getGraphDatabaseService() {
        if (graphDb == null) {
            setup();
        }
        return graphDb;
    }

    public static void setup() {
        graphDb = new GraphDatabaseFactory().newEmbeddedDatabaseBuilder(DB_PATH)
            //.setConfig(GraphDatabaseSettings.mapped_memory_page_size, "256M")
            // .setConfig(GraphDatabaseSettings.pagecache_memory, "50%")
             //.setConfig(GraphDatabaseSettings.string_block_size, "60")
             //.setConfig(GraphDatabaseSettings.array_block_size, "300")
             //.setConfig(GraphDatabaseSettings.keep_logical_logs, "false")
            .newGraphDatabase();
        registerShutdownHook(graphDb);
    }

    private static void registerShutdownHook(final GraphDatabaseService graphDb) {
        // Registers a shutdown hook for the Neo4j instance so that it
        // shuts down nicely when the VM exits (even if you "Ctrl-C" the
        // running application).
        Runtime.getRuntime().addShutdownHook(new Thread() {
            @Override
            public void run() {
                graphDb.shutdown();
            }
        });
    }
}
