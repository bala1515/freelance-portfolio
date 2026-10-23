import React, { useRef, useState } from "react";
export function MotionHeading({ as: Tag = "h2", children, ...props }) {
  let i = 0;
  const split = (nodes) =>
    React.Children.map(nodes, (node) => {
      if (typeof node === "string")
        return node.split(/(\s+)/).map((word, n) =>
          /^\s+$/.test(word) ? (
            word
          ) : (
            <span className="eb-word" key={`${word}-${n}`}>
              <span style={{ "--word": i++ }}>{word}</span>
            </span>
          ),
        );
      if (React.isValidElement(node) && node.type !== "br")
        return React.cloneElement(node, {}, split(node.props.children));
      return node;
    });
  return (
    <Tag {...props} className={`eb-motion-heading ${props.className || ""}`}>
      {split(children)}
    </Tag>
  );
}
export function DraggableChip({ children, index }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const start = useRef(null);
  return (
    <button
      type="button"
      className="eb-draggable-chip"
      style={{
        "--tilt": `${[-4, 3, -2, 5, 1][index % 5]}deg`,
        "--drag-x": `${offset.x}px`,
        "--drag-y": `${offset.y}px`,
      }}
      aria-label={`${children}. Drag to move; double-click or press Escape to reset.`}
      onPointerDown={(e) => {
        start.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (start.current)
          setOffset({
            x: Math.max(-100, Math.min(100, e.clientX - start.current.x)),
            y: Math.max(-65, Math.min(65, e.clientY - start.current.y)),
          });
      }}
      onPointerUp={() => {
        start.current = null;
      }}
      onPointerCancel={() => {
        start.current = null;
      }}
      onDoubleClick={() => setOffset({ x: 0, y: 0 })}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOffset({ x: 0, y: 0 });
      }}
    >
      {children}
      <span aria-hidden="true">↗</span>
    </button>
  );
}
