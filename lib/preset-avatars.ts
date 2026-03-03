export type PresetAvatar = {
  id: string
  emoji: string
  bgClass: string
}

export const PRESET_AVATARS: PresetAvatar[] = [
  { id: "a1", emoji: "🥗", bgClass: "bg-sandeli-purple" },
  { id: "a2", emoji: "🍎", bgClass: "bg-sandeli-magenta" },
  { id: "a3", emoji: "🥑", bgClass: "bg-sandeli-lavender" },
  { id: "a4", emoji: "🌿", bgClass: "bg-sandeli-dark" },
  { id: "a5", emoji: "🍊", bgClass: "bg-sandeli-purple" },
  { id: "a6", emoji: "🥤", bgClass: "bg-sandeli-magenta" },
  { id: "a7", emoji: "🍉", bgClass: "bg-sandeli-lavender" },
  { id: "a8", emoji: "🍓", bgClass: "bg-sandeli-purple" },
  { id: "a9", emoji: "🥕", bgClass: "bg-sandeli-magenta" },
  { id: "a10", emoji: "🍍", bgClass: "bg-sandeli-dark" },
  { id: "a11", emoji: "🍋", bgClass: "bg-sandeli-lavender" },
  { id: "a12", emoji: "🫐", bgClass: "bg-sandeli-purple" },
]

export function getPresetAvatarEmoji(id: string | null | undefined) {
  if (!id) return PRESET_AVATARS[0].emoji
  return PRESET_AVATARS.find((avatar) => avatar.id === id)?.emoji || PRESET_AVATARS[0].emoji
}
