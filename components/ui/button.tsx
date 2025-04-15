import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 will-change-transform",
    {
        variants: {
            variant: {
                default:
                    "bg-[hsla(var(--btn-default)/0.3)] text-[hsl(var(--btn-default-foreground))] border border-[hsla(var(--btn-default)/0.6)] hover:bg-[hsla(var(--btn-default)/0.4)] hover:border-[hsla(var(--btn-default)/0.8)] hover:shadow-[0_0_15px_hsla(var(--btn-default)/0.3)]",
                destructive:
                    "bg-[hsla(var(--btn-destructive)/0.3)] text-[hsl(var(--btn-destructive-foreground))] border border-[hsla(var(--btn-destructive)/0.6)] hover:bg-[hsla(var(--btn-destructive)/0.4)] hover:border-[hsla(var(--btn-destructive)/0.8)] hover:shadow-[0_0_15px_hsla(var(--btn-destructive)/0.3)]",
                outline:
                    "bg-[hsla(var(--background)/0.2)] border border-[hsla(var(--btn-outline-border)/0.4)] hover:bg-[hsla(var(--btn-outline-hover-bg)/0.3)] hover:border-[hsla(var(--primary)/0.5)] hover:shadow-[0_0_15px_hsla(var(--primary)/0.15)]",
                secondary:
                    "bg-[hsla(var(--btn-secondary)/0.3)] text-[hsl(var(--btn-secondary-foreground))] border border-[hsla(var(--btn-secondary)/0.6)] hover:bg-[hsla(var(--btn-secondary)/0.4)] hover:border-[hsla(var(--btn-secondary)/0.8)] hover:shadow-[0_0_15px_hsla(var(--btn-secondary)/0.3)]",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline hover:text-[hsla(var(--primary)/0.8)]",
                success:
                    "bg-[hsla(var(--btn-success-bg)/0.3)] text-green-500 border border-[hsla(var(--btn-success-border)/0.6)] hover:bg-[hsla(var(--btn-success-bg)/0.4)] hover:border-[hsla(var(--btn-success-border)/0.8)] hover:shadow-[0_0_15px_hsla(var(--btn-success-border)/0.3)]",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
            glass: {
                true: "backdrop-blur-sm",
                false: "",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            glass: false,
        },
    },
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
    glass?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, glass, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, glass, className }))}
                ref={ref}
                style={{ transform: "translateZ(0)" }}
                {...props}
            />
        )
    },
)
Button.displayName = "Button"

export { Button, buttonVariants }