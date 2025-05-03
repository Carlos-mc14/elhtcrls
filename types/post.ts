export interface Post {
    _id: string
    title: string
    slug: string
    coverImage?: string
    excerpt?: string
    content?: string
    createdAt: string
    tags?: string[]
    author?: {
      _id?: string
      name?: string
      image?: string
    }
    diaryEntries?: DiaryEntry[]
    comments?: Comment[]
    isCompleted?: boolean
  }
  
  export interface DiaryEntry {
    _id: string
    content: string
    images?: string[]
    date: string
    dayNumber: number
  }
  
  export interface Comment {
    _id: string
    content: string
    author: {
      _id: string
      name?: string
      image?: string
    }
    createdAt: string
  }
  