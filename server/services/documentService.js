const db = require("../config/db");

const create_heirarchy = (node, allNodes, result) => {
  node?.children_ids.forEach(async (children_node_id, index) => {
    const children_node = allNodes[children_node_id];
    if (children_node_id === node.node_id) return;
    if (!result.children) {
      result.children = [];
    }
    result.children.push(children_node);
    await create_heirarchy(children_node, allNodes, result.children[index]);
  });
};

async function getAllNodesData() {
  // fetching parent_id with all its children_id
  let [hierarchy] = await db.promise().query(`
    WITH RECURSIVE ChildHierarchy AS (
      SELECT node_id, parent_id
      FROM document_nodes
      WHERE parent_id is null
      UNION
      SELECT t.node_id, t.parent_id
      FROM document_nodes t
      JOIN ChildHierarchy c ON t.parent_id = c.node_id
    )
    SELECT
      GROUP_CONCAT(node_id) AS children_ids,
      parent_id AS parent_id
    FROM ChildHierarchy
    GROUP BY parent_id;`);

  // fetching all nodes
  const [documentNodes] = await db
    .promise()
    .query(`select node_id, parent_id, content as name from document_nodes`);

  // removing element where root node from children_ids and parent list
  hierarchy = hierarchy.filter((node) => node.parent_id);

  const nodes = {};
  documentNodes.forEach((node) => {
    const node_children = hierarchy.find((parent_node) => {
      return parent_node.parent_id === node.node_id;
    });
    node.children_ids = node_children?.children_ids.split(",") ?? [];
    nodes[node.node_id] = node;
  });
  const root_node = documentNodes.find((node) => node.parent_id == null);
  await create_heirarchy(root_node, nodes, root_node);

  return root_node;
}

async function addNode(parentId, content) {
  // Add a new node to the document structure
  const [result] = await db
    .promise()
    .query("INSERT INTO document_nodes (parent_id, content) VALUES (?, ?)", [
      parentId,
      content,
    ]);

  return result.insertId;
}

async function editNode(nodeId, content) {
  // Edit the content of a specific node
  return await db
    .promise()
    .query("UPDATE document_nodes SET content = ? WHERE node_id = ?", [
      content,
      nodeId,
    ]);
}

async function deleteNode(nodeId) {
  // Delete a specific node from the document structure
  return await db
    .promise()
    .query("DELETE FROM document_nodes WHERE node_id = ? OR parent_id = ?", [
      nodeId,
      nodeId,
    ]);
}

module.exports = {
  getAllNodesData,
  addNode,
  editNode,
  deleteNode,
};
