'use client';

import { useState } from 'react';
import {
	DndContext,
	DragOverlay,
	KeyboardSensor,
	PointerSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors
} from '@dnd-kit/core';
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { getPartyColor, getPartyFullName } from '@/lib/components/virtualElection/partyMeta';
import styles from './RankedBallot.module.css';

function PartyRow({ party, position, disabled, isOverlay = false }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: party,
		disabled
	});

	const style = isOverlay
		? undefined
		: {
				transform: CSS.Transform.toString(transform),
				transition
			};

	const className = [
		styles.row,
		isOverlay ? styles.rowOverlay : '',
		isDragging && !isOverlay ? styles.rowPlaceholder : '',
		disabled ? styles.rowDisabled : ''
	]
		.filter(Boolean)
		.join(' ');

	return (
		<li
			ref={isOverlay ? undefined : setNodeRef}
			style={style}
			className={className}
			{...(isOverlay ? {} : attributes)}
			{...(isOverlay ? {} : listeners)}
		>
			<span className={styles.handle} aria-hidden="true">
				⋮⋮
			</span>
			<span className={styles.position} aria-hidden="true">
				{position}
			</span>
			<span className={styles.swatch} style={{ background: getPartyColor(party) }} />
			<span className={styles.name}>{getPartyFullName(party)}</span>
		</li>
	);
}

/**
 * Ordered list of every party. The voter drags rows (mouse, touch or keyboard: focus a row,
 * press Space, use the arrow keys, press Space again) to reorder; position 1 is the first
 * preference.
 */
export default function RankedBallot({ ranking = [], defaultOrder = [], disabled = false, onChange }) {
	const [activeParty, setActiveParty] = useState(null);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		// A short press-and-hold on touch screens keeps normal page scrolling working.
		useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	function handleDragStart(event) {
		setActiveParty(String(event.active.id));
	}

	function handleDragEnd(event) {
		const { active, over } = event;
		setActiveParty(null);
		if (!over || active.id === over.id) return;
		const from = ranking.indexOf(String(active.id));
		const to = ranking.indexOf(String(over.id));
		if (from < 0 || to < 0) return;
		onChange?.(arrayMove(ranking, from, to));
	}

	return (
		<div className={styles.ballot}>
			<div className={styles.header}>
				<span id="ranked-ballot-label">Drag to rank every party (1 = first preference)</span>
				<button
					type="button"
					className={styles.resetBtn}
					disabled={disabled}
					onClick={() => onChange?.([...defaultOrder])}
				>
					Reset order
				</button>
			</div>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				modifiers={[restrictToVerticalAxis]}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				onDragCancel={() => setActiveParty(null)}
			>
				<SortableContext items={ranking} strategy={verticalListSortingStrategy}>
					<ol className={styles.list} aria-labelledby="ranked-ballot-label">
						{ranking.map((party, index) => (
							<PartyRow key={party} party={party} position={index + 1} disabled={disabled} />
						))}
					</ol>
				</SortableContext>
				<DragOverlay>
					{activeParty ? (
						<ol className={styles.overlayList}>
							<PartyRow
								party={activeParty}
								position={ranking.indexOf(activeParty) + 1}
								disabled={false}
								isOverlay
							/>
						</ol>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
}
