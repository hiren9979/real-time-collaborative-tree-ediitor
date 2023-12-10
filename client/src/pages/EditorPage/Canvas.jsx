/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import Tree from "react-d3-tree";
import toast from "react-hot-toast";
import { addNode, deleteNode, editNode } from "../../services/api";
import CustomNode from "../../components/CustomNode";
import CustomDialog from "../../components/CustomDialog";
import { Menu, MenuItem } from "@mui/material";
import CustomInput from "../../components/CustomInput";
import ACTIONS from "../../actions/Actions";

const Canvas = ({ socketRef, roomId, onTreeChange }) => {
  const [documentNodes, setDocumentNodes] = useState();
  const [selectedNode, setSelectedNode] = useState();
  const [newNodeContent, setNewNodeContent] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState();
  const [onConfirmAction, setOnConfirmAction] = useState();

  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const treeContainer = useRef(null);

  const openMenuClick = (event, node) => {
    setAnchorEl(event.currentTarget);
    setSelectedNode(node);
  };
  const closeMenu = () => {
    setAnchorEl(null);
    setSelectedNode({});
  };

  const onDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedNode({});
  };

  const onConfirm =
    (isEdit = false) =>
    async (node) => {
      try {
        if (isEdit) await editNode(node.node_id, node.name);
        else await addNode(node.node_id, node.name);

        handleTreeChange();
      } catch (e) {
        toast.error("Someting wend wrong");
      }
      setIsDialogOpen(false);
    };

  const onAddOrEdit = (isEdit) => () => {
    const onChange = (value) => {
      setSelectedNode({ ...selectedNode, name: value });
    };

    setDialogTitle(isEdit ? "Edit Node" : "Add Node");
    setDialogContent(
      <CustomInput val={selectedNode.name} onChange={onChange} />
    );
    setOnConfirmAction(() => onConfirm(isEdit));
    setIsDialogOpen(true);
    setAnchorEl(null);
  };

  const onDelete = () => {
    const onDeleteConfirm = async () => {
      try {
        await deleteNode(selectedNode.node_id);

        handleTreeChange();
      } catch (e) {
        toast.error("Something Went Wrong");
      }
      setIsDialogOpen(false);
    };

    setDialogTitle("Delete Node");
    setDialogContent(
      "Are you sure you want to delete this and all it's child nodes?"
    );
    setOnConfirmAction(() => onDeleteConfirm);
    setIsDialogOpen(true);
    setAnchorEl(null);
  };

  const handleTreeChange = () => {
    socketRef.current.emit(ACTIONS.TREE_CHANGE, {
      roomId,
      nodes: documentNodes,
    });

    onTreeChange(documentNodes);
  };

  const addNewRootNode = async () => {
    try {
      await addNode(null, newNodeContent);

      handleTreeChange();
    } catch (e) {
      toast.error("Someting wend wrong");
    }
  };

  useEffect(() => {
    const dimensions = treeContainer.current.getBoundingClientRect();
    setTranslate({
      x: dimensions.width / 2,
      y: dimensions.height / 5,
    });

    // Listen for code changes from other clients
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.TREE_CHANGE, ({ nodes }) => {
        if (nodes !== null) {
          onTreeChange(documentNodes);
          setDocumentNodes(nodes);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.TREE_CHANGE);
      }
    };
  }, [documentNodes, socketRef.current]);

  return (
    <>
      <div className="TreeEditor" ref={treeContainer}>
        {documentNodes ? (
          <Tree
            data={documentNodes}
            translate={translate}
            orientation="vertical"
            renderCustomNodeElement={CustomNode(openMenuClick)}
          />
        ) : (
          <div style={{ display: "inline-grid" }}>
            <input
              className="TreeEditorInputField"
              type="text"
              placeholder="Enter Value"
              value={newNodeContent}
              onChange={(e) => setNewNodeContent(e.target.value)}
            />
            <button className="TreeEditorButton" onClick={addNewRootNode}>
              Add Root Node
            </button>
          </div>
        )}
      </div>
      <Menu
        id="demo-positioned-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem onClick={onAddOrEdit()}>Add</MenuItem>
        <MenuItem onClick={onAddOrEdit(true)}>Edit</MenuItem>
        <MenuItem onClick={onDelete}>Delete</MenuItem>
      </Menu>
      {isDialogOpen && (
        <CustomDialog
          open={isDialogOpen}
          content={dialogContent}
          title={dialogTitle}
          onConfirm={onConfirmAction}
          onCancel={onDialogClose}
          selectedNode={selectedNode}
        />
      )}
    </>
  );
};

export default Canvas;
