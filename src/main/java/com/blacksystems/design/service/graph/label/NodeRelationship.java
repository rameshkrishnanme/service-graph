package com.blacksystems.design.service.graph.label;

import org.neo4j.graphdb.RelationshipType;

public enum NodeRelationship implements RelationshipType {

    HAS,
    
    OWNS,
    
    INVOKES;
    
    
}
