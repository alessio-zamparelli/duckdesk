import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export default function SortableItem(props: { id: string }) {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners} className="m-2 bg-slate-600 p-2">
			{props.id}
		</div>
	)
}
