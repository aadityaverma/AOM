import type React from 'react';

interface SidebarProps {
  fileNames: string[];
  current: string;
  onSelect: (name: string) => void;
}

export default function Sidebar({ fileNames, current, onSelect }: SidebarProps) {
  return (
    <aside className="sidebar">
      <h2>Files</h2>
      <ul>
        {fileNames.map((name) => (
          <li
            key={name}
            className={name === current ? 'active' : undefined}
            onClick={() => onSelect(name)}
          >
            {name}
          </li>
        ))}
      </ul>
    </aside>
  );
}