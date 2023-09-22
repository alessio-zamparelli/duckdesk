import React, { forwardRef, CSSProperties } from "react"
import clsx from "clsx"

import styles from "./Button.module.css"

export interface Props extends React.HTMLAttributes<HTMLButtonElement> {
	active?: {
		fill: string
		background: string
	}
	cursor?: CSSProperties["cursor"]
}

export const Button = forwardRef<HTMLButtonElement, Props>(({ active, className, cursor, style, ...props }, ref) => {
	return (
		<button
			ref={ref}
			{...props}
			className={clsx(styles.Action, className)}
			tabIndex={0}
			style={
				{
					...style,
					cursor,
					"--fill": active?.fill,
					"--background": active?.background,
				} as CSSProperties
			}
		/>
	)
})
