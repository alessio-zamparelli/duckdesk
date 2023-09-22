import "./index.css"

import Contact, { loader as contactLoader, action as contactAction } from "./routes/contact.jsx"
import EditContact, { action as editAction } from "./routes/edit"
import ErrorPage from "./error-page"
import Index from "./routes/index"
import React from "react"
import ReactDOM from "react-dom/client"
import Root, { loader as rootLoader, action as rootAction } from "./routes/root"
import { action as destroyAction } from "./routes/destroy"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

// Import init function from "@neutralinojs/lib"
import { init } from "@neutralinojs/lib"
import Demo1 from "./routes/demo1.tsx"
import Charts from "./routes/charts.tsx"

const router = createBrowserRouter([
	{
		path: "/",
		element: <Root />,
		errorElement: <ErrorPage />,
		loader: rootLoader,
		action: rootAction,
		children: [
			{ index: true, element: <Index /> },
			{
				path: "contacts/:contactId",
				element: <Contact />,
				loader: contactLoader,
				action: contactAction,
			},
			{
				path: "contacts/:contactId/edit",
				element: <EditContact />,
				loader: contactLoader,
				action: editAction,
			},
			{
				path: "contacts/:contactId/destroy",
				action: destroyAction,
				errorElement: <div>Oops! There was an error.</div>,
			},
			{
				path: "demo1",
				element: <Demo1 />,
				errorElement: <div>Oops! There was an error.</div>,
			},
			{
				path: "charts",
				element: <Charts />,
				errorElement: <div>Oops! There was an error.</div>,
			},
		],
	},
])

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
)

init() // Add this function call
