import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  addList,
  getAllListData,
  getListIds,
  persistListOrder,
  removeList,
} from '@/utils/list-utils';
import MainList from './MainList';
import Masonry from 'react-masonry-css';

function ResizableDraggableGrid() {
  const [lists, setLists] = useState([]);
  const [listIds, setListIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isDraggingAny, setIsDraggingAny] = useState(null);

  useEffect(() => {
    fetchLists();
  }, []);

  useEffect(() => {
    persistListOrder(lists);
  }, [lists]);

  const fetchLists = async () => {
    const data = await getAllListData();
    if (data) {
      setLists(data);
      const ids = await getListIds(data);
      setListIds(ids);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setIsDraggingAny(true);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setIsDraggingAny(false);
    if (!over || active.id === over.id) return;

    const oldIndex = lists.findIndex(l => l.list_metadata.list_id === active.id);
    const newIndex = lists.findIndex(l => l.list_metadata.list_id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const newList = arrayMove(lists, oldIndex, newIndex);
      setLists(newList);
      setListIds(newList.map(l => l.list_metadata.list_id));
    }
  };

  const handleAddList = async () => {
    const listName = window.prompt("Please enter name for new list:");
    if (!listName) return;
    const newId = crypto.randomUUID();

    const newList = {
      list_data: [],
      list_metadata: { list_id: newId },
      list_name: listName,
    };

    await addList(newList);
    setLists(prev => [newList, ...prev]);
    setListIds(prev => [newId, ...prev]);
  };

  const handleRemoveList = (id, list) => {
    const confirmed = window.confirm(`Are you sure you want to remove list "${list.list_name}"?`);
    if (!confirmed) return;
    setLists(prev => prev.filter(l => l.list_metadata.list_id !== id));
    setListIds(prev => prev.filter(i => i !== id));
    removeList(id);
  };

  const activeList = lists.find(l => l.list_metadata.list_id === activeId);

  return (
    <>
      <style>{`
        .my-masonry-grid {
          display: flex;
          margin-left: -1rem;
          width: auto;
        }
        .my-masonry-grid_column {
          padding-left: 1rem;
          background-clip: padding-box;
        }
        .my-masonry-grid_column > div {
          margin-bottom: 1rem;
        }
      `}</style>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={listIds} strategy={rectSortingStrategy}>
          <Masonry
            breakpointCols={{
              default: 5,
              1200: 4,
              900: 3,
              600: 2,
              400: 1,
            }}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {lists.map(list => (
              <DraggableItem
                key={list.list_metadata.list_id}
                id={list.list_metadata.list_id}
                list={list}
                isDragging={activeId === list.list_metadata.list_id}
                isDraggingAny={isDraggingAny}
                onRemove={handleRemoveList}
              />
            ))}

            <div
              onClick={handleAddList}
              style={{
                padding: '1rem',
                border: '1px dashed #ccc',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              + Add List
            </div>
          </Masonry>
        </SortableContext>

        <DragOverlay>
          {activeList && (
            <div
              style={{
                padding: '1rem',
                border: '2px dashed #aaa',
                borderRadius: '8px',
                backgroundColor: 'white',
                width: '300px',
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h2 style={{ margin: 0 }}>{activeList.list_name}</h2>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
}

function DraggableItem({ id, list, isDragging, isDraggingAny, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxSizing: 'border-box',
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: 'white',
    width: '300px',
    minHeight: isDraggingAny ? '600px' : 'unset',
    opacity: isDragging ? 0.2 : 1,
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {!isDragging && (
        <>
          <div
            {...attributes}
            {...listeners}
            style={{ cursor: 'grab', paddingBottom: '0.5rem' }}
          >
            <h2 style={{ margin: 0 }}>...</h2>
          </div>

          <button
            onClick={() => onRemove(id, list)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
            }}
          >
            &times;
          </button>

          <MainList list={list} />
        </>
      )}
    </div>
  );
}

export default ResizableDraggableGrid;
