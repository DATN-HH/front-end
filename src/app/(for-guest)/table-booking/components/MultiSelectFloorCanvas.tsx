"use client"

import { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { TableResponse } from '@/api/v1/tables';
import { TableElement } from '@/app/(app-section)/app/settings/floor-management/[floorId]/components/TableElement';
import { cn } from '@/lib/utils';

interface MultiSelectFloorCanvasProps {
  floor: {
    id: number;
    name: string;
    imageUrl: string;
    order: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  tables: TableResponse[];
  selectedTables: TableResponse[]; // Changed from single table to array
  onTableSelect: (tables: TableResponse[]) => void; // Changed to handle array
  selectableTables?: number[]; // Array of table IDs that can be selected
}

export function MultiSelectFloorCanvas({
  floor,
  tables,
  selectedTables,
  onTableSelect,
  selectableTables
}: MultiSelectFloorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [imageSize, setImageSize] = useState({ width: 800, height: 600, offsetX: 0, offsetY: 0 });
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    if (floor.imageUrl) {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const canvasAspectRatio = canvasSize.width / canvasSize.height;

        let width, height, offsetX = 0, offsetY = 0;

        if (aspectRatio > canvasAspectRatio) {
          width = canvasSize.width;
          height = width / aspectRatio;
          offsetY = (canvasSize.height - height) / 2;
        } else {
          height = canvasSize.height;
          width = height * aspectRatio;
          offsetX = (canvasSize.width - width) / 2;
        }

        setImageSize({ width, height, offsetX, offsetY });
      };
      img.src = floor.imageUrl;
    } else {
      setImageSize({ width: canvasSize.width, height: canvasSize.height, offsetX: 0, offsetY: 0 });
    }
  }, [floor.imageUrl, canvasSize]);

  // Convert ratio to pixels (based on actual image size)
  const ratioToPixels = (ratio: number, dimension: 'width' | 'height') => {
    const size = dimension === 'width' ? imageSize.width : imageSize.height;
    const offset = dimension === 'width' ? imageSize.offsetX : imageSize.offsetY;
    return offset + (ratio * size);
  };

  const handleTableClick = (table: TableResponse, event: React.MouseEvent) => {
    event.stopPropagation();

    // Check if table is selectable
    if (selectableTables && !selectableTables.includes(table.id)) {
      return; // Don't allow selection of unavailable tables
    }

    const isSelected = selectedTables.some(t => t.id === table.id);

    // Multi-select mode: either Ctrl/Cmd key OR multi-select mode is enabled
    if (event.ctrlKey || event.metaKey || isMultiSelectMode) {
      if (isSelected) {
        // Remove from selection
        onTableSelect(selectedTables.filter(t => t.id !== table.id));
      } else {
        // Add to selection
        onTableSelect([...selectedTables, table]);
      }
    } else {
      // Single select mode
      if (isSelected && selectedTables.length === 1) {
        // Deselect if it's the only selected table
        onTableSelect([]);
      } else {
        // Select only this table
        onTableSelect([table]);
      }
    }
  };

  const handleCanvasClick = () => {
    // Clear all selections when clicking on empty canvas
    onTableSelect([]);
  };

  return (
    <div className="relative w-full h-full bg-white border rounded-lg overflow-hidden">
      {/* Multi-select toggle button for mobile */}
      <div className="absolute top-2 right-2 z-20 flex gap-2">
        <button
          onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${isMultiSelectMode
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
        >
          {isMultiSelectMode ? 'Multi-Select ON' : 'Multi-Select OFF'}
        </button>
      </div>

      {/* Background Image */}
      {floor.imageUrl && (
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: `url(${floor.imageUrl})` }}
        />
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
        style={{ minHeight: '600px' }}
      >
        {/* Tables */}
        {Array.isArray(tables) && tables.map((table) => {
          const x = ratioToPixels(table.xRatio ?? table.xratio ?? 0.5, 'width');
          const y = ratioToPixels(table.yRatio ?? table.yratio ?? 0.5, 'height');
          const width = (table.widthRatio ?? table.widthratio ?? 0.1) * imageSize.width;
          const height = (table.heightRatio ?? table.heightratio ?? 0.1) * imageSize.height;

          const isSelected = selectedTables.some(t => t.id === table.id);
          const isSelectable = selectableTables ? selectableTables.includes(table.id) : true;

          return (
            <Rnd
              key={table.id}
              size={{ width, height }}
              position={{ x, y }}
              disableDragging={true}
              enableResizing={false}
              bounds="parent"
              className={`
                ${isSelected ? 'ring-2 ring-blue-500' : ''}
                z-10 cursor-pointer
              `}
            >
              <TableElement
                table={table}
                isSelected={isSelected}
                onClick={(e) => handleTableClick(table, e)}
                isDragging={false}
                unable={!isSelectable}
              />
            </Rnd>
          );
        })}

        {/* Show message when no tables available */}
        {(!Array.isArray(tables) || tables.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">No tables available</p>
              <p className="text-sm">Please select a different floor or time</p>
            </div>
          </div>
        )}
      </div>

      {/* Multi-select instructions */}
      {selectedTables.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded max-w-48">
          {selectedTables.length} table{selectedTables.length > 1 ? 's' : ''} selected
          <br />
          <span className="opacity-75">
            {isMultiSelectMode
              ? 'Multi-select mode active'
              : 'Ctrl+Click or enable multi-select'}
          </span>
        </div>
      )}
    </div>
  );
}
