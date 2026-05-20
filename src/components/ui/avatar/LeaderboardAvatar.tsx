"use client"

import FramedAvatar from "./FramedAvatar"

type LeaderboardAvatarProps = {
  src?: string | null
  alt: string
  size?: number
  completedTodayCount?: number | null
}

export default function LeaderboardAvatar({
  src,
  alt,
  size = 108,
  completedTodayCount,
}: LeaderboardAvatarProps) {
  return (
    <FramedAvatar
      src={src}
      alt={alt}
      size={size}
      completedTodayCount={completedTodayCount}
      frameSize="large"
    />
  )
}
