/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
import React, { useState, useEffect } from 'react';
import Tree, { RawNodeDatum } from 'react-d3-tree';
import data from './EXO_FULL.json';

interface TreeView {
    onNodeClicked: (nodeDatum: RawNodeDatum, evt: React.MouseEvent) => void;
    
}

const TreeView = () => {

  type BackendNode = {
    children: number[]
    text: string
    index: number
  }

  interface RawNodeDatum {
    name: string;
    attributes?: Record<string, string | number | boolean>;
    children?: RawNodeDatum[];
  }

  const mapLayersToArray = (): BackendNode[][] => {
    const layers = Object.keys(data).length;
    const layerAcc: BackendNode[][] = [];

    for (let i = 0; i < layers; i++) {
      layerAcc[i] = data['layer_' + i];
    }

    return layerAcc;
  }

  const flatMapLayers = (): BackendNode[] => {
    let acc: BackendNode[] = [];
    const layers = Object.keys(data).length;

    for (let i = 0; i < layers; i++) {
      acc = [...acc, ...data['layer_' + i]]
    }
    return acc;
  }

  const flatLayers = flatMapLayers();

  const getNode = (id: number): BackendNode | undefined => {
    return flatLayers.find((a) => a.index === id);
  }

  const _mapdata = (arrData: BackendNode[], nodeIdx: number): RawNodeDatum => {
    const curNode = getNode(nodeIdx)!!;
    if (curNode.children.length === 0) {
      const t: RawNodeDatum= {
        attributes: { text: curNode.text },
        name: `${curNode.index}`,
        children: []
      };
      return t;
    }

    const children = curNode.children.map((childIdx) => _mapdata(arrData, childIdx));
    
    const t: RawNodeDatum = {
      attributes: { text: curNode.text },
      name: `${curNode.index}`,
      children: children
    };
    return t;
  }

  const mapData = (): RawNodeDatum => {
    console.log("running map data")
    const arrData = mapLayersToArray();
    arrData.forEach(layer => layer.sort((a, b) => b.index - a.index));

    const mappedRootNodes = arrData[arrData.length - 1].map(node => _mapdata(arrData[arrData.length - 1], node.index));
    const root: RawNodeDatum = {
      name: `root`,
      children: mappedRootNodes
    };
    return root;
  }

  const [treeData, setTreeData] = useState<RawNodeDatum>();

  useEffect(() => {
    const mappedData = mapData();
    setTreeData(mappedData);
  }, []);


  useEffect(() => {
    console.log("tree data updated")
    console.log(treeData)
  }, [treeData])


  const handleNodeClick = (nodeDatum: RawNodeDatum, evt: React.MouseEvent) => {
    console.log('Node clicked:', nodeDatum);
    const text = nodeDatum?.attributes?.text
    if(text) {
      console.log("Setting text: " + text)
    //   setSelectedNodeText(`${text}`) TODO: replace this with onNodeClicked
    }
  };

  const renderCustomNode = ({ nodeDatum, toggleNode }: { nodeDatum: RawNodeDatum; toggleNode: () => void }) => (
    <g>
      <circle
        r={15}
        fill="lightblue"
        onClick={(evt) => {
          handleNodeClick(nodeDatum, evt);
          toggleNode();
        }}
      />
      <text fill="black" x="20" dy=".35em">
        {nodeDatum.name}
      </text>
    </g>
  );

  return (
    <>
        {treeData ? (
            <Tree
                data={treeData}
                rootNodeClassName="node__root"
                branchNodeClassName="node__branch"
                leafNodeClassName="node__leaf"
                initialDepth={1}
                renderCustomNodeElement={renderCustomNode}
            />
        ) : (
            <></>
        )}
    </>
  );
};


export default TreeView;