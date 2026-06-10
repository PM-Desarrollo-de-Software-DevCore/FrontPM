"use client"

import FramedAvatar from "./FramedAvatar"

type LeaderboardAvatarProps = {
  src?: string | null
  alt: string
  size?: number
  completedTodayCount?: number | null
  /** Posición en el leaderboard (1-based): marco para los primeros 3 lugares. */
  rank?: number | null
}

export default function LeaderboardAvatar({
  src,
  alt,
  size = 108,
  completedTodayCount,
  rank,
}: LeaderboardAvatarProps) {
  return (
    <FramedAvatar
      src={src}
      alt={alt}
      size={size}
      completedTodayCount={completedTodayCount}
      rank={rank}
      frameSize="large"
    />
  )
}
