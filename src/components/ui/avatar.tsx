
import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { Image } from "lucide-react"
import { cn } from "@/lib/utils"
import { convertGoogleDriveUrl } from "@/lib/formatters"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> & { src?: string }
>(({ className, src, ...props }, ref) => {
  const [hasError, setHasError] = React.useState(false)
  const [processedSrc, setProcessedSrc] = React.useState<string | undefined>(undefined)
  
  // Process Google Drive URLs
  React.useEffect(() => {
    if (src) {
      const processed = convertGoogleDriveUrl(src)
      setProcessedSrc(processed)
      setHasError(false)
      console.log("AvatarImage - Image URL set to:", processed);
    } else {
      setProcessedSrc(undefined)
    }
  }, [src])
  
  const onError = () => {
    console.error("Avatar image failed to load:", processedSrc)
    setHasError(true)
  }

  if (hasError || !processedSrc) {
    return (
      <AvatarFallback>
        <Image className="h-6 w-6 text-gray-400" />
      </AvatarFallback>
    )
  }

  return (
    <AvatarPrimitive.Image
      ref={ref}
      src={processedSrc}
      onError={onError}
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  )
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
