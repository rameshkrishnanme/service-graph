package com.blacksystems.design.service.graph;

import static org.neo4j.helpers.collection.MapUtil.map;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.neo4j.graphdb.Direction;
import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.Relationship;
import org.neo4j.graphdb.ResourceIterator;
import org.neo4j.graphdb.Result;
import org.springframework.stereotype.Component;

import com.blacksystems.design.service.graph.executor.CypherExecutor;
import com.blacksystems.design.service.graph.executor.JdbcEmbeddedCypherExecutor;
import com.blacksystems.design.service.graph.label.NodeLabel;
import com.blacksystems.design.service.graph.label.NodeRelationship;

@SuppressWarnings("rawtypes")
@Component
public class ServiceGraphService {

    private final CypherExecutor cypher;

    private final static NodeLabel[] showNodes = { NodeLabel.Operation, NodeLabel.Service };

    public ServiceGraphService() {
        cypher = createCypherExecutor();
    }

    private CypherExecutor createCypherExecutor() {
        return new JdbcEmbeddedCypherExecutor();
    }

    public Map<String, Object> graph() {
        Result resultNode = cypher.queryResult("MATCH (n) OPTIONAL MATCH (n)-[r]->() RETURN n, COLLECT(r) as r", null);
        List nodes = new ArrayList();
        List domain = new ArrayList();
        List service = new ArrayList();
        List operation = new ArrayList();

        ResourceIterator<Node> resultIteratorN = resultNode.columnAs("n");
        // Building Nodes.
        buildMapsNode(nodes, domain, service, operation, resultIteratorN);

        List rels = new ArrayList();
        Result resultRels = cypher.queryResult("MATCH (n)-[r]->() RETURN r", null);
        ResourceIterator<Relationship> resultIteratorR = resultRels.columnAs("r");
        // Building Relationships.
        buildMapsRel(rels, resultIteratorR);

        return map("nodes", nodes, "links", rels, "domain", domain, "service", service, "operation", operation);
    }

    private void buildMapsRel(List rels, ResourceIterator<Relationship> resultIteratorR) {
        while (resultIteratorR.hasNext()) {

            Relationship rel = resultIteratorR.next();

            if (isShowableNodes(rel.getStartNode()) && isShowableNodes(rel.getEndNode())) {

                Map<String, Object> allProperties = rel.getAllProperties();
                allProperties.put("source", rel.getStartNode().getId());
                allProperties.put("target", rel.getEndNode().getId());
                rels.add(allProperties);

            }

        }

    }

    private void buildMapsNode(List nodes, List domain, List service, List operation,
        ResourceIterator<Node> resultIteratorN) {
        while (resultIteratorN.hasNext()) {
            Node resultNode = resultIteratorN.next();
            Map<String, Object> allProperties = resultNode.getAllProperties();
            Object dName = null;

            if (resultNode.hasLabel(NodeLabel.Domain)) {
                dName = buildDomainProperties(domain, allProperties);
            }
            if (resultNode.hasLabel(NodeLabel.Service)) {
                dName = buildServiceProperties(service, resultNode, allProperties);
            }
            if (resultNode.hasLabel(NodeLabel.Operation)) {
                dName = buildOperationProperties(operation, resultNode, allProperties);
            }

            if (dName != null) {
                allProperties.put("dname", dName);
            }
            allProperties.put("uid", resultNode.getId());
            if (isShowableNodes(resultNode)) {
                nodes.add(allProperties);
            }
        }
    }

    private static boolean isShowableNodes(Node sNode) {
        for (NodeLabel nLabel : showNodes) {
            if (sNode.hasLabel(nLabel)) {
                return Boolean.TRUE;
            }
        }
        return Boolean.FALSE;
    }

    private Object buildDomainProperties(List domain, Map<String, Object> allProperties) {
        Object dName;
        // Domain.
        domain.add(allProperties);
        // domain.add(map("label", NodeLabel.Domain));
        dName = allProperties.get("Name");
        return dName;
    }

    private Object buildServiceProperties(List service, Node resultNode, Map<String, Object> allProperties) {
        Object dName;
        // Service.
        Relationship singleRelationship = resultNode.getSingleRelationship(NodeRelationship.HAS, Direction.INCOMING);
        if (singleRelationship != null) {
            allProperties.put("domainUid", singleRelationship.getStartNode().getId());
        }
        service.add(allProperties);
        // service.add(map("label", NodeLabel.Service));
        dName = allProperties.get("Name");
        return dName;
    }

    private Object buildOperationProperties(List operation, Node resultNode, Map<String, Object> allProperties) {

        Object dName;
        // Operation.

        Iterable<Relationship> inRelationships = resultNode.getRelationships(NodeRelationship.INVOKES,
            Direction.INCOMING);

        if (inRelationships != null) {

            List inRels = new ArrayList();

            for (Relationship relationship : inRelationships) {
                inRels.add(relationship.getStartNode().getId());
            }
            allProperties.put("incoming", inRels);
        }

        Iterable<Relationship> outRelationships = resultNode.getRelationships(NodeRelationship.INVOKES,
            Direction.OUTGOING);

        if (outRelationships != null) {

            List outRels = new ArrayList();

            for (Relationship relationship : outRelationships) {
                outRels.add(relationship.getEndNode().getId());
            }
            allProperties.put("outcoming", outRels);
        }

        Relationship serviceRelationship = resultNode.getSingleRelationship(NodeRelationship.OWNS, Direction.INCOMING);

        if (serviceRelationship != null) {
            allProperties.put("serviceUid", serviceRelationship.getStartNode().getId());
            // DOMAIN ID.
            Relationship domainRelationship = serviceRelationship.getStartNode().getSingleRelationship(
                NodeRelationship.HAS, Direction.INCOMING);
            if (domainRelationship != null) {
                allProperties.put("domainUid", domainRelationship.getStartNode().getId());
            }
        }

        operation.add(allProperties);
        // operation.add(map("label", NodeLabel.Operation));
        dName = allProperties.get("OperationName");
        return dName;
    }

    public Object cquery(String query) {
        List<Result> result = cypher.queryResult(query, null, Boolean.TRUE);
        String resultStr = null;
        for (Result result2 : result) {
            resultStr += result2.resultAsString() + "\n";
        }
        return map("status", "success", "result", resultStr);
    }
}
