export interface HomeBannerItem {
  id: number
  title: string
  imageUrl: string
  linkUrl?: string
}

export interface HomeStatItem {
  label: string
  value: string | number
  key?: string
}