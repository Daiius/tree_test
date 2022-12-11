import React, { useState, useEffect } from 'react';

import { TreeNode } from "./tree";

export interface SimpleNode {
  id: string;
  text: string;
  children: SimpleNode[];
};

interface SimpleTreeProps {
  node: SimpleNode;
  nodeToComponent: (node: SimpleNode) => React.ReactNode;
};

const SimpleTree = (props: SimpleTreeProps) => {
  const { node, nodeToComponent } = props;
  return (
    <>
      <li>{nodeToComponent(node)}</li>
      {node.children.length > 0 &&
        <ul>
          {node.children.map((child, i) => 
            <li key={`node-${node.id}-${i}`}>{nodeToComponent(child)}</li>
          )}
        </ul>
      }
    </>
  );
};

export default SimpleTree;
