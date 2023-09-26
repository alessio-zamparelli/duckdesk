import {
	Outlet,
	useLoaderData,
	Link,
	Form,
	redirect,
	NavLink,
	useNavigation,
	useSubmit,
	NavLinkProps,
} from "react-router-dom"
import { getContacts, createContact } from "../contacts"
import { useEffect, MouseEventHandler, useState } from "react"

export async function loader({ request }) {
	const url = new URL(request.url)
	const q = url.searchParams.get("q")
	const contacts = await getContacts()
	return { contacts, q }
}

export async function action() {
	const contact = await createContact()
	return redirect(`/contacts/${contact.id}/edit`)
}

export default function Root() {
	const { contacts, q } = useLoaderData()
	const navigation = useNavigation()
	const submit = useSubmit()

	const [menuToggle, setMenuToggle] = useState(false)

	const searching = navigation.location && new URLSearchParams(navigation.location.search).has("q")

	useEffect(() => {
		const el = document.getElementById("q") as HTMLInputElement
		el.value = q
	}, [q])

	const handleToggle: MouseEventHandler<HTMLButtonElement> = () => {
		setMenuToggle((s) => !s)
	}

	return (
		<>
			<div
				id="sidebar"
				className={`${menuToggle ? "w-80" : "w-80"} bg-gray-100 border-r-gray-500 border-r-[1px] flex flex-col`}
			>
				<h1 className="text-gray-500">DuckDesk - azmp</h1>

				<div>
					<Form id="search-form" role="search">
						<input
							id="q"
							className={searching ? "loading" : ""}
							aria-label="Search contacts"
							placeholder="Search"
							type="search"
							name="q"
							defaultValue={q}
							onChange={(event) => {
								const isFirstSearch = q == null
								submit(event.currentTarget.form, {
									replace: !isFirstSearch,
								})
							}}
						/>
						<div id="search-spinner" aria-hidden hidden={!searching} />
						<div className="sr-only" aria-live="polite"></div>
					</Form>
					<Form method="post">
						<button type="submit">New</button>
					</Form>
					<button onClick={handleToggle} className={``}>
						{menuToggle ? `>` : `<`}
					</button>
				</div>

				<nav>
					<ul>
						<li>
							<NavLink
								to={`demo1`}
								className={({ isActive, isPending }: NavLinkProps) =>
									isActive ? "active" : isPending ? "pending" : ""
								}
							>
								demo1
							</NavLink>
						</li>

						<li>
							<NavLink
								to={`charts`}
								className={({ isActive, isPending }: NavLinkProps) =>
									isActive ? "active" : isPending ? "pending" : ""
								}
							>
								charts
							</NavLink>
						</li>

						{/* {contacts.length ? (
							contacts.map((contact) => (
								<li key={contact.id}>
									<NavLink
										to={`contacts/${contact.id}`}
										className={({ isActive, isPending }) => (isActive ? "active" : isPending ? "pending" : "")}
									>
										<Link to={`contacts/${contact.id}`}>
											{contact.first || contact.last ? (
												<>
													{contact.first} {contact.last}
												</>
											) : (
												<i>No Name</i>
											)}{" "}
											{contact.favorite && <span>★</span>}
										</Link>
									</NavLink>
								</li>
							))
						) : (
							<p>
								<i>No contacts</i>
							</p>
						)} */}
					</ul>
				</nav>
			</div>
			<div id="detail" className={navigation.state === "loading" ? "loading" : ""}>
				<Outlet />
			</div>
		</>
	)
}
