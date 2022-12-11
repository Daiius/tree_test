import React, { useEffect, useState } from 'react';


import { TreeNode } from './tree';

export interface TreeViewProps {
  node: TreeNode;
  nodeToComponent: (node: TreeNode) => React.ReactNode;
};


const TreeView = (props: TreeViewProps) => {
  const { node, nodeToComponent } = props;
  return (
    <ul>
      {nodeToComponent(node)}
    </ul>
  );
};

export default TreeView;
