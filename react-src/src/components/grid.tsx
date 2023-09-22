import {
	// useState,
	useRef,
	// useEffect,
	useMemo,
	useCallback,
	MouseEventHandler,
} from "react"

import { AgGridReact } from "ag-grid-react" // the AG Grid React Component

import "ag-grid-community/styles/ag-grid.css" // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css" // Optional theme CSS

export interface IGrid {
	rowData: AgGridReact["props"]["rowData"]
	columnDefs: AgGridReact["props"]["columnDefs"]
}

export default function Grid({ rowData, columnDefs }: IGrid) {
	const gridRef = useRef<AgGridReact>(null)

	const defaultColDef = useMemo(
		() => ({
			sortable: true,
		}),
		[]
	)

	// Example of consuming Grid Event
	const cellClickedListener = useCallback((event) => {
		console.log("cellClicked", event)
	}, [])

	const buttonListener = useCallback<MouseEventHandler<HTMLButtonElement>>(
		(e) => {
			e.preventDefault()
			gridRef.current?.api.deselectAll()
		},
		[]
	)

	return (
		<div className="h-full w-full">
			<button className="my-1" onClick={buttonListener}>
				Push Me
			</button>

			<div className="ag-theme-alpine w-full h-full">
				<AgGridReact
					ref={gridRef} // Ref for accessing Grid's API
					rowData={rowData} // Row Data for Rows
					columnDefs={columnDefs} // Column Defs for Columns
					defaultColDef={defaultColDef} // Default Column Properties
					animateRows={true} // Optional - set to 'true' to have rows animate when sorted
					rowSelection="multiple" // Options - allows click selection of rows
					onCellClicked={cellClickedListener} // Optional - registering for Grid Event
					// onCellClicked={(e) => e} // Optional - registering for Grid Event
				/>
			</div>
		</div>
	)
}
