import React, { useState, useEffect, useMemo } from 'react';

import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import { v4 as uuid } from 'uuid';

import { TreeNode, search, listIds, hasChild } from './tree';

import TreeView from './TreeView';

import SimpleTree, { SimpleNode } from './SimpleTree';

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
}

const TreeNodeComponent = (props: TreeNodeComponentProps) => {
  const {tree, setTree, removeTree} = props;

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
  };

  const handleChange = (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
    if (tree.properties != null) {
      const newProperties = {...tree.properties};
      newProperties[key] = e.target.value;
      setTree({...tree, properties: newProperties});
    }
  };

const nodeToComponent = (node: TreeNode) => {

  return (
    <>
      {node.id}
      <Stack direction="horizontal" gap={2}>
        <Stack className="stack-conditions" direction="vertical">
          {node.properties != null &&
            Object.entries(node.properties).map(([key, value]) =>
              <FloatingLabel controlId="floatingInput" label={key}>
                <Form.Control type="text" key={"textfield-nodeitem-properties-"+key}
                              placeholder={key} value={value} onChange={handleChange(key)}
                              />
              </FloatingLabel>)
          }
          <Stack direction="horizontal">
            <Button size="sm" onClick={handleAddChild(node)} variant="outline-primary">
              次工程の追加
            </Button>
            {removeTree &&
              <Button onClick={() => removeTree()} variant="outline-primary">削除</Button>
            }
          </Stack>
        </Stack>
        {node.evaluations.map((evaluation, index) =>
          <Stack key={"evaluations-stack-"+node.id+"-"+index} direction="vertical"
                 className="stack-evaluations">
            {Object.entries(evaluation).map(([key, value]) =>
              <FloatingLabel label={key}>
                <Form.Control key={"textfield-nodeitem-evaluations-"+key}
                              value={value} onChange={handleChange(key)}
                              placeholder={key}/>
              </FloatingLabel>
            )}
            <Button variant="outline-primary" onClick={deleteEvaluation(index)}>
              評価の削除
            </Button>
          </Stack>
        )}
        <Button size="sm" variant="outline-primary" onClick={addEvaluation}>
          評価の追加
        </Button>
      </Stack>
      <ul>
        <li>{node.children.map((child) => nodeToComponent(child))}</li>
      </ul>
    </>
  );
};

  return nodeToComponent(tree);

  //return useMemo(() => (
  //  <TreeItem nodeId={tree.id} label={`${nodeToDepthName(tree)} ${nodeToDescendantInfo(tree)}`}
  //            sx={{background: nodeToColor(tree), ml: 1.5}}>
  //    
  //    {tree.children.map((node, idx) => (
  //      <TreeNodeComponent
  //        key={node.id}
  //        tree={node}
  //        setTree={ (newSubtree) => {
  //          const newChildren = [...tree.children];
  //          newChildren[idx] = newSubtree;
  //          setTree({...tree, children: newChildren});
  //        } }
  //        removeTree={ () => {
  //          const newChildren = tree.children.slice(0, idx).concat(tree.children.slice(idx + 1));
  //          setTree({...tree, children: newChildren});
  //        } }
  //        expanded={expanded}
  //        setExpanded={setExpanded}
  //        />
  //    ))}
  //  </TreeItem>
  //), [props]);
};

const MainContainer = () => {

  const [tree, setTree] = useState<TreeNode>({
    id: uuid(), depth: 0, children: [],
    properties: {"test": "property"}, evaluations: [{"test": "evaluation"}]
    });

  const simpleData = { id: "root", text: "This is root", children: [
    { id: "child1", text: "This is child1", children: []},
    { id: "child2", text: "This is child2", children: [
      { id: "child3", text: "This is child3", children: []}
    ]},
    { id: "child4", text: "This is child4", children: []}
  ]};

  return (
    <Tabs defaultActiveKey="main" id="contents-tabs">
      <Tab eventKey="main" title="Main">
        <TreeNodeComponent tree={tree}
                           setTree={ (newSubtree) => {
                             const idx = 0;
                             const newChildren = [...tree.children];
                             newChildren[idx] = newSubtree;
                             setTree({...tree, children: newChildren});
                           } }
                           removeTree={ () => {
                             const idx = 0;
                             const newChildren = tree.children
                                     .slice(0, idx).concat(tree.children
                                     .slice(idx + 1));
                             setTree({...tree, children: newChildren});
                           } }
                           />
      </Tab>
      <Tab eventKey="simple" title="Simple">
        <div>simple tree test</div>
        <ul>
          <SimpleTree node={simpleData} nodeToComponent={(node: SimpleNode)=>(
            <div>{node.text}</div>
          )}/>
        </ul>
      </Tab>
    </Tabs>
   );
};

export default MainContainer;

