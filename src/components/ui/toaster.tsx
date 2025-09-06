"use client"

import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, AlertTriangle, Info } from "lucide-react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-3">
              {props.variant === 'success' && (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              )}
              {props.variant === 'destructive' && (
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              {(!props.variant || props.variant === 'default' || props.variant === 'warning') && (
                <Info className="h-5 w-5 text-foreground/70 mt-0.5" />
              )}
              <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
