import React from 'react'

// Preserve heading semantics and editorial line breaks without duplicating text.
export default function RevealHeading({ children, ...props }) {
  const lines = [[]]
  React.Children.toArray(children).forEach(child => {
    if (React.isValidElement(child) && child.type === 'br') lines.push([])
    else lines[lines.length - 1].push(child)
  })
  return <h2 {...props} className={`text-reveal-heading ${props.className || ''}`}>
    {lines.map((line, index) => <span className="text-reveal-line" key={index}><span className="text-reveal-inner">{line}</span></span>)}
  </h2>
}
