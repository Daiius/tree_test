import React, { useState, useEffect, useMemo } from 'react';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TextField from '@material-ui/core/TextField';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';

import { v4 as uuid } from 'uuid';

import { TreeNode, search, listIds, hasChild } from './tree';

const checkDepthForward = (node: TreeNode): number => {
  if (node.children.length <= 0) return 0;
  return node.children.reduce((acc, curr)=> Math.max(acc, checkDepthForward(curr)), 0) + 1;
};

const depthToColor = (depth: number): string => {
  if (depth === 0)
    return "lavenderblush";
  else if (depth === 1)
    return "honeydew";
  else
    return "aliceblue";
};

const evaluationTemplate = {
  "evaluation": "template",
  "test": "points",
};

const propertyTemplate = {
  "text": "default",
  "test": "content",
  "complex": "patterns"
};

const nodeToColor = (node: TreeNode) => depthToColor(node.depth);

const nodeToDepthName = (node: TreeNode): string => {
  if (node.depth === 0)
    return "root";
  else
    return "grand".repeat(node.depth - 1) + "child";
};

const nodeToDescendantInfo = (node: TreeNode) => {
  const depth = checkDepthForward(node);
  const nchild = node.children.length;
  return (nchild == 0 ? "" : `分岐： ${nchild} `)
       + (depth  == 0 ? "" : `最大深さ: ${depth} `);
};

type TreeNodeComponentProps = {
  tree: TreeNode,
  setTree: (nodes: TreeNode) => void,
  removeTree: (() => void) | null,
  expanded: string[],
  setExpanded: (expanded: string[]) => void,
}

const TreeNodeComponent = (props: TreeNodeComponentProps) => {
  const {tree, setTree, removeTree, expanded, setExpanded} = props;

  console.log(`<TreeNodeComponent tree.id=${tree.id}>`);

  const addEvaluation = () => {
    setTree({...tree, evaluations: [...tree.evaluations, {...evaluationTemplate}]});
  };

  const deleteEvaluation = (index: number) => () => {
    setTree({
      ...tree,
      evaluations: tree.evaluations.slice(0, index).concat(tree.evaluations.slice(index + 1)),
    });
  };

  const handleAddChild = (parent: TreeNode) => () => {
    const newId = uuid();
    const newChild = {
      id: newId,
      depth: parent.depth + 1,
      children: [],
      properties: propertyTemplate,
      evaluations: [],
    };
    const go = (node: TreeNode): TreeNode | null => {
      if (node.id === parent.id) {
        return {...node, children: [...node.children, newChild]};
      } else if (node.children) {
        return {...node, children: node.children.map(child => go(child) || child)};
      } else {
        return null;
      }
    };
    setTree(go(tree) || tree);
    setExpanded([...expanded, newId]);
  };

  const handleChange = (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
    if (tree.properties != null) {
      const newProperties = {...tree.properties};
      newProperties[key] = e.target.value;
      setTree({...tree, properties: newProperties});
    }
  };

  return (
    <TreeItem nodeId={tree.id} label={`${nodeToDepthName(tree)} ${nodeToDescendantInfo(tree)}`}
              >
      <div style={{display: "flex"}}>
        <div>
          {tree.properties != null &&
            Object.entries(tree.properties).map(([key, value]) =>
                <TextField label={key} key={"textfield-treeitem-properties-"+key}
                           value={value} onChange={handleChange(key)}
                           size="small"/>
              )
          }
          <div style={{display: "flex"}}>
            <Button size="small" onClick={handleAddChild(tree)} variant="outlined" fullWidth>
              次工程の追加
            </Button>
            {removeTree &&
              <Button onClick={() => removeTree()} variant="outlined">削除</Button>
            }
          </div>
        </div>
        {tree.evaluations.map((evaluation, index) =>
          <div key={"evaluations-stack-"+tree.id+"-"+index}>
            {Object.entries(evaluation).map(([key, value]) =>
              <TextField label={key} key={"textfield-treeitem-evaluations-"+key}
                         value={value} onChange={handleChange(key)}
                         size="small"/>
            )}
            <Button variant="outlined" onClick={deleteEvaluation(index)}
                    size="small">
              評価の削除
            </Button>
          </div>
        )}
        <Button style={{height: "40px"}} size="small" variant="outlined" onClick={addEvaluation}>
          評価の追加
        </Button>
      </div>
      {tree.children.map((node, idx) => (
        <TreeNodeComponent
          key={node.id}
          tree={node}
          setTree={ (newSubtree) => {
            const newChildren = [...tree.children];
            newChildren[idx] = newSubtree;
            setTree({...tree, children: newChildren});
          } }
          removeTree={ () => {
            const newChildren = tree.children.slice(0, idx).concat(tree.children.slice(idx + 1));
            setTree({...tree, children: newChildren});
          } }
          expanded={expanded}
          setExpanded={setExpanded}
          />
      ))}
    </TreeItem>
  );
};

const MainContainer = () => {

  const [tree, setTree] = useState<TreeNode>({
    id: uuid(), depth: 0, children: [],
    properties: {"test": "property"}, evaluations: [{"test": "evaluation"}]
    });

  const [expanded, setExpanded] = useState(["0"]);

  useEffect(()=>{
    const ids = listIds(tree);
    setExpanded(ids);
  }, []);

  const handleToggle = (e: React.ChangeEvent<{}>, nodeIds: string[]) => {
    console.log("handleToggle", nodeIds);
    setExpanded(nodeIds);
  };

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpanded={['root']}
      defaultExpandIcon={<ChevronRightIcon />}
      expanded={expanded} onNodeToggle={handleToggle}
    >
      <Button variant="outlined">書き込み</Button>
      <TreeNodeComponent
        tree={tree}
        setTree={setTree}
        removeTree={null}
        expanded={expanded}
        setExpanded={setExpanded}
        />
    </TreeView>
  );
};

export default MainContainer;

