"use client"

import Image from "next/image"

type FramedAvatarProps = {
  src?: string | null
  alt: string
  size?: number
  completedTodayCount?: number | null
  /** Posición en el leaderboard (1-based). Asigna marco a los primeros 3 lugares. */
  rank?: number | null
  priority?: boolean
  className?: string
  imageClassName?: string
  showDefaultFrame?: boolean
  frameSize?: "small" | "medium" | "large" | "xl"
}

// Marco por posición del leaderboard: 1º diamante, 2º plata, 3º bronce; del 4º en
// adelante sin marco.
function getRankFrameSource(rank?: number | null) {
  if (rank === 1) return "/images/marco/Marco_diamante.svg"
  if (rank === 2) return "/images/marco/Marco_plata.svg"
  if (rank === 3) return "/images/marco/Marco_bronce.svg"
  return null
}

function getFrameSource(completedTodayCount?: number | null) {
  if (completedTodayCount === 1) return "/images/marco/Marco_bronce.svg"
  if (completedTodayCount === 2) return "/images/marco/Marco_plata.svg"
  if (completedTodayCount !== null && completedTodayCount !== undefined && completedTodayCount >= 3) {
    return "/images/marco/Marco_diamante.svg"
  }

  return null
}

function getFrameSourceWithDefault(completedTodayCount?: number | null, showDefault?: boolean) {
  const frame = getFrameSource(completedTodayCount)
  if (frame) return frame
  if (showDefault) return "/images/marco/Marco_bronce.svg"
  return null
}

function getFrameOffsetClass(frameSize?: "small" | "medium" | "large" | "xl") {
  switch (frameSize) {
    case "small":
      return "-inset-1"
    case "medium":
      return "-inset-2"
    case "large":
      return "-inset-3"
    case "xl":
      return "-inset-4"
    default:
      return "-inset-2"
  }
}

export default function FramedAvatar({
  src,
  alt,
  size = 100,
  completedTodayCount,
  rank,
  priority = false,
  className = "",
  imageClassName = "",
  showDefaultFrame = false,
  frameSize = "large",
}: FramedAvatarProps) {
  // Si viene `rank` (contexto leaderboard), el marco lo define la posición top-3;
  // si no, se usa la lógica por tareas completadas hoy.
  const frameSource =
    rank !== undefined && rank !== null
      ? getRankFrameSource(rank)
      : getFrameSourceWithDefault(completedTodayCount, showDefaultFrame)
  const fallbackSrc = "/images/persona.png"
  const frameOffsetClass = getFrameOffsetClass(frameSize)

  return (
    <div
      className={`relative inline-block overflow-visible ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="relative z-10 h-full w-full overflow-hidden rounded-full">
        <Image
          src={src || fallbackSrc}
          alt={alt}
          fill
          sizes={`${size}px`}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className={`object-cover ${imageClassName}`}
        />
      </div>

      {frameSource && (
        <div className={`pointer-events-none absolute ${frameOffsetClass} z-20`}>
          <Image
            src={frameSource}
            alt={`${alt} frame`}
            fill
            sizes={`${size + 16}px`}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className="object-contain"
          />
        </div>
      )}
    </div>
  )
}
