import * as duckdb from "@duckdb/duckdb-wasm"
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url"
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url"
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url"
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url"

import { MouseEventHandler, useEffect, useState } from "react"
import { Field, Int, Table } from "@apache-arrow/ts"
import { filesystem, os } from "@neutralinojs/lib"
import Grid, { IGrid } from "../components/grid"
import { ReactECharts, ReactEChartsProps } from "../components/echarts"
import DnD, { DnDItems } from "../components/dnd"
import { UniqueIdentifier } from "@dnd-kit/core"

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
	mvp: {
		mainModule: duckdb_wasm,
		mainWorker: mvp_worker,
	},
	eh: {
		mainModule: duckdb_wasm_eh,
		mainWorker: eh_worker,
	},
}
// Select a bundle based on browser checks
const bundle = await duckdb.selectBundle(MANUAL_BUNDLES)
// Instantiate the asynchronus version of DuckDB-wasm
const worker = new Worker(bundle.mainWorker!)
const logger = new duckdb.ConsoleLogger()
const db = new duckdb.AsyncDuckDB(logger, worker)
await db.instantiate(bundle.mainModule, bundle.pthreadWorker)

export default function Charts() {
	const [rowData, setRowData] = useState<IGrid["rowData"]>()
	const [columnDefs, setColumnDefs] = useState<IGrid["columnDefs"]>()
	const [items, setItems] = useState<DnDItems>({})
	const [showChart, setShowChart] = useState(false)
	const [option, setOption] = useState<ReactEChartsProps["option"]>(initialOption)

	useEffect(() => {
		console.log(items)
	}, [items])

	const handleLoadFile: MouseEventHandler<HTMLButtonElement> = async (event) => {
		event.preventDefault()

		const entries = await os.showOpenDialog("Select a parquet file to open", {
			// defaultPath: "/home/my/directory/",
			multiSelections: false,
			filters: [
				{ name: "Parquet", extensions: ["parquet"] },
				{ name: "CSV", extensions: ["csv", "tsv"] },
			],
		})
		console.log("You have selected:", entries[0])
		if (entries.length !== 1) {
			return
		}
		const filename = entries[0].split("\\").pop()?.split("/").pop() ?? ""

		const pickedFile = new Uint8Array(await filesystem.readBinaryFile(entries[0]))

		await db.registerFileBuffer(filename, pickedFile)

		const conn = await db.connect()

		const res = await conn.query<{ v: Int }>(`SELECT * from ${filename}`)

		setColumnDefs(res.schema.fields.map((e: Field) => ({ field: e.name, filter: false })))
		setRowData([...res.toArray()])
	}

	const handleLoadDemoData: MouseEventHandler<HTMLButtonElement> = async (event) => {
		event.preventDefault()

		const data = await filesystem.readBinaryFile(
			"/Users/alessiozamparelli/GitHub/duckdesk/demo_parquet/green_tripdata_2023-01.parquet"
		)
		// const data = await filesystem.readBinaryFile("/Users/alessiozamparelli/GitHub/duckdesk/demo_parquet/demo1.parquet")
		const pickedFile = new Uint8Array(data)

		await db.registerFileBuffer("local.parquet", pickedFile)

		const conn = await db.connect()

		const arrowTable = (await conn.query(`SELECT * from 'local.parquet'`)) as Table

		setColumnDefs(arrowTable.schema.fields.map((e) => ({ field: e.name, filter: false })))
		setRowData([...arrowTable.toArray()])

		// setItems({ avaible: res.schema.fields.map((e) => e.name) })

		setItems({
			avaible: arrowTable.schema.fields.map((e) => e.name) as UniqueIdentifier[],
			X: [],
			Y: [],
		})

		const tbl = []
		tbl.push(arrowTable.schema.fields.map((e) => e.name))
		console.log(tbl)
		// const l = arrowTable.[0]
		// console.log("🚀", l)

		// for (const row of arrowTable) {
		// 	console.log(row)
		// }
		// console.table([...arrowTable.toArray()])

		// for (const row of arrowTable) {
		// 	if (Array.isArray(row)) {
		// 		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		// 		const row2 = (row as any[]).reduce((acc, cell) => acc.push(cell == null ? "-null-" : cell), [] as any[])
		// 		tbl.push(row2)
		// 	} else {
		// 		console.log("not an array", row)
		// 		tbl.push(row)
		// 	}
		// }

		console.log("arrowTable[xxxx]")
		// console.log(arrowTable.getChild("VendorID")?.toArray())
		const lpep_pickup_datetime = arrowTable.getChild("lpep_pickup_datetime")?.toArray()
		console.log(lpep_pickup_datetime)
		const trip_distance = arrowTable.getChild("trip_distance")?.toArray()
		console.log(trip_distance)

		setOption((s) => ({
			...s,
			dataset: { source: { lpep_pickup_datetime: lpep_pickup_datetime, trip_distance: trip_distance } },
			legend: { data: ["lpep_pickup_datetime", "trip_distance"] },
		}))

		// const source = arrowTable.batches
		// console.log("🚀", source)
		// setItems(c)
		// console.log({ avaible: res.schema.fields.map((e) => e.name) })
	}

	return (
		<div className="h-full space-y-2">
			<h1>Demo1</h1>
			<div className="flex gap-2">
				<button onClick={handleLoadDemoData} className="">
					Load Demo Data
				</button>
				<button onClick={handleLoadFile} className="">
					Load file
				</button>
				<button onClick={() => void setShowChart((s) => !s)} className="">
					Show Chart
				</button>
			</div>

			{Object.keys(items).length > 0 && (
				<div className="">
					<DnD items={items} setItems={setItems} />
				</div>
			)}

			{showChart && <ReactECharts option={option} />}

			{rowData && columnDefs && <Grid columnDefs={columnDefs} rowData={rowData} />}
		</div>
	)
}

const initialOption: ReactEChartsProps["option"] = {
	dataset: {
		source: [
			["Commodity", "Owned", "Financed"],
			["Commodity 1", 4, 1],
			["Commodity 2", 2, 4],
			["Commodity 3", 3, 6],
			["Commodity 4", 5, 3],
		],
	},
	tooltip: {
		trigger: "axis",
		axisPointer: {
			type: "shadow",
		},
	},
	legend: {
		data: ["Owned", "Financed"],
	},
	grid: {
		left: "10%",
		right: "0%",
		top: "20%",
		bottom: "20%",
	},
	xAxis: {
		type: "time",
	},
	yAxis: {
		type: "value",
	},
	series: [
		{
			type: "bar",
			stack: "total",
			label: {
				show: true,
			},
		},
		{
			type: "bar",
			stack: "total",
			label: {
				show: true,
			},
		},
	],
}
