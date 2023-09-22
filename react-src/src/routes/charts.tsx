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
import MultiSelectSort from "../components/sortableList"
import DnD from "../components/dnd"

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
	const [queryResult, setQueryResult] = useState([])
	const [rowData, setRowData] = useState<IGrid["rowData"]>()
	const [columnDefs, setColumnDefs] = useState<IGrid["columnDefs"]>()
	const [items, setItems] = useState([])
	const [showChart, setShowChart] = useState(false)

	const handleLoadParquet: MouseEventHandler<HTMLButtonElement> = async (event) => {
		event.preventDefault()

		const entries = await os.showOpenDialog("Select a parquet file to open", {
			// defaultPath: "/home/my/directory/",
			multiSelections: false,
			filters: [{ name: "Parquet", extensions: ["parquet"] }],
		})
		console.log("You have selected:", entries[0])

		const pickedFile = new Uint8Array(await filesystem.readBinaryFile(entries[0]))

		await db.registerFileBuffer("local.parquet", pickedFile)

		const conn = await db.connect()

		const res = await conn.query<{ v: Int }>(`SELECT * from 'local.parquet'`)

		setColumnDefs(res.schema.fields.map((e: Field) => ({ field: e.name, filter: false })))
		setRowData([...res.toArray()])
	}

	const handleLoadDemoData: MouseEventHandler<HTMLButtonElement> = async (event) => {
		event.preventDefault()

		const data = await filesystem.readBinaryFile("/Users/alessiozamparelli/GitHub/duckdesk/demo1.parquet")
		const pickedFile = new Uint8Array(data)

		await db.registerFileBuffer(
			"local.parquet",
			pickedFile
			// duckdb.DuckDBDataProtocol.BUFFER,
			// true
		)

		console.log(pickedFile.length)

		const conn = await db.connect()

		const res = (await conn.query<{ v: Int }>(`SELECT * from 'local.parquet'`)) as Table

		setColumnDefs(res.schema.fields.map((e) => ({ field: e.name, filter: false })))
		setRowData([...res.toArray()])
	}

	const option: ReactEChartsProps["option"] = {
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
			type: "value",
		},
		yAxis: {
			type: "category",
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

	return (
		<div className="h-full space-y-2">
			<h1>Demo1</h1>
			<div className="flex gap-2">
				<button onClick={handleLoadDemoData} className="">
					Load Demo Data
				</button>
				<button onClick={handleLoadParquet} className="">
					Load Parquet
				</button>
				<button onClick={() => void setShowChart((s) => !s)} className="">
					Show Chart
				</button>
			</div>

			<div className="">
				<DnD />
			</div>

			{showChart && <ReactECharts option={option} />}

			{rowData && columnDefs && <Grid columnDefs={columnDefs} rowData={rowData} />}
		</div>
	)
}
